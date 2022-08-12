import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as path from 'path'
import { DockerImageCode } from 'aws-cdk-lib/aws-lambda'

const MOUNT_PATH = '/mnt/db'
const DB_NAME = 'phoquash.sqlite3'

export interface DatabaseConnectionProps {
  url?: string
  host?: string
  port?: string
  engine?: string
  username?: string
  password?: string
}

interface PrismaFunctionProps extends nodeLambda.NodejsFunctionProps {
  database?: DatabaseConnectionProps
}

class PrismaFunction extends nodeLambda.NodejsFunction {
  constructor(scope: Construct, id: string, props: PrismaFunctionProps) {
    super(scope, id, {
      ...props,
      environment: {
        ...props.environment,
        DATABASE_URL: props.database?.url || `file:${MOUNT_PATH}/${DB_NAME}`,
        DATABASE_HOST: props.database?.host || '',
        DATABASE_PORT: props.database?.port || '',
        DATABASE_ENGINE: props.database?.engine || '',
        DATABASE_USER: props.database?.username || '',
        DATABASE_PASSWORD: props.database?.password || ''
      },
      bundling: {
        forceDockerBundling: false,
        nodeModules: ['@prisma/client'].concat(props.bundling?.nodeModules ?? []),
        commandHooks: {
          beforeInstall: (inputDir: string, outputDir: string) => [
            // Copy prisma directory to Lambda code asset
            // the directory must be located at the same directory as your Lambda code
            `cp -r ${inputDir}/prisma ${outputDir}`
          ],
          beforeBundling: (_inputDir: string, _outputDir: string) => [],
          afterBundling: (_inputDir: string, outputDir: string) => [
            // lambdaの容量制限対策
            `rm -rf ${outputDir}/node_modules/@prisma/engines`
            // `cp -r ${inputDir}/node_modules/prisma ${outputDir}/node_modules`
          ]
        }
      },
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler'
    })
  }
}

// interface PrismaMigrationFunctionProps extends nodeLambda.NodejsFunctionProps {
//   database?: DatabaseConnectionProps
// }

// class PrismaMigrationFunction extends nodeLambda.NodejsFunction {
//   constructor(scope: Construct, id: string, props: PrismaMigrationFunctionProps) {
//     super(scope, id, {
//       ...props,
//       environment: {
//         ...props.environment,
//         DATABASE_URL: props.database?.url || `file:${MOUNT_PATH}/${DB_NAME}`,
//         DATABASE_HOST: props.database?.host || '',
//         DATABASE_PORT: props.database?.port || '',
//         DATABASE_ENGINE: props.database?.engine || '',
//         DATABASE_USER: props.database?.username || '',
//         DATABASE_PASSWORD: props.database?.password || ''
//       },
//       bundling: {
//         forceDockerBundling: false,
//         nodeModules: ['@prisma/client', 'prisma'].concat(props.bundling?.nodeModules ?? []),
//         commandHooks: {
//           beforeInstall: (inputDir: string, outputDir: string) => [
//             // Copy prisma directory to Lambda code asset
//             // the directory must be located at the same directory as your Lambda code
//             `cp -r ${inputDir}/prisma ${outputDir}`
//           ],
//           beforeBundling: (_inputDir: string, _outputDir: string) => [],
//           afterBundling: (_inputDir: string, outputDir: string) => [
//             // lambdaの容量制限対策のため、ファイルサイズの大きいprisma enginesを削除する
//             `find ${outputDir}/node_modules/prisma -type f | grep 'query-engine-darwin' | xargs rm -rf`
//           ]
//         }
//       },
//       runtime: lambda.Runtime.NODEJS_16_X,
//       handler: 'handler',
//       timeout: Duration.minutes(4)
//     })
//   }
// }

interface DockerPrismaFunctionProps extends lambda.DockerImageFunctionProps {
  database?: DatabaseConnectionProps
}

export class DockerPrismaFunction extends lambda.DockerImageFunction {
  constructor(scope: Construct, id: string, props: DockerPrismaFunctionProps) {
    super(scope, id, {
      ...props,
      environment: {
        ...props.environment,
        DATABASE_URL: props.database?.url || `file:${MOUNT_PATH}/${DB_NAME}`,
        DATABASE_HOST: props.database?.host || '',
        DATABASE_PORT: props.database?.port || '',
        DATABASE_ENGINE: props.database?.engine || '',
        DATABASE_USER: props.database?.username || '',
        DATABASE_PASSWORD: props.database?.password || ''
      }
    })
  }
}

export class Lambda {
  public migrationLambda: lambda.Function
  public postUserLambda: lambda.Function
  public deleteUserLambda: lambda.Function
  public deleteUserByIdLambda: lambda.Function
  public getUserByIdLambda: lambda.Function
  public postTravelRecordLambda: lambda.Function
  public deleteTravelRecordLambda: lambda.Function
  public deleteTravelRecordByIdLambda: lambda.Function
  public postTravelLambda: lambda.Function
  public deleteTravelLambda: lambda.Function
  public deleteTravelByIdLambda: lambda.Function
  public getTravelByIdLambda: lambda.Function
  public postPhotoLambda: lambda.Function
  public uploadPhotoDataLambda: lambda.Function
  public nodeLayer: lambda.LayerVersion
  private readonly accessPoint: efs.AccessPoint
  private readonly vpc: ec2.Vpc

  constructor(accessPoint: efs.AccessPoint, vpc: ec2.Vpc) {
    this.accessPoint = accessPoint
    this.vpc = vpc
  }

  public createResources(scope: Construct) {
    this.nodeLayer = new lambda.LayerVersion(scope, 'nodeLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layer')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
      description: 'node layer',
      layerVersionName: 'node-layer'
    })

    this.migrationLambda = new DockerPrismaFunction(scope, 'migration', {
      code: DockerImageCode.fromImageAsset('./'),
      // bundling: {
      //   dockerImage: DockerImage.fromBuild('./')
      // },
      memorySize: 256,
      timeout: Duration.minutes(5),
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'migrationLambda',
      vpc: this.vpc
    })
    // this.migrationLambda = new PrismaMigrationFunction(scope, 'migration', {
    //   filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
    //   functionName: 'migrationLambda',
    //   entry: path.join(__dirname, '../lambda/function/migration/index.ts'),
    //   vpc: this.vpc
    // })
    this.postUserLambda = new PrismaFunction(scope, 'postUser', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'postUserLambda',
      entry: path.join(__dirname, '../lambda/function/user/createUser.ts'),
      vpc: this.vpc
    })
    this.deleteUserLambda = new PrismaFunction(scope, 'deleteUser', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteUserLambda',
      entry: path.join(__dirname, '../lambda/function/user/deleteUser.ts'),
      vpc: this.vpc
    })
    this.deleteUserByIdLambda = new PrismaFunction(scope, 'deleteUserById', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteUserByIdLambda',
      entry: path.join(__dirname, '../lambda/function/user/userId/deleteUserById.ts'),
      vpc: this.vpc
    })
    this.getUserByIdLambda = new nodeLambda.NodejsFunction(scope, 'getUserById', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'getUserByIdLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/user/userId/getUserById.ts'),
      vpc: this.vpc
    })

    this.postTravelRecordLambda = new nodeLambda.NodejsFunction(scope, 'postTravelRecordLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'postTravelRecordLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travelRecord/createTravelRecord.ts'),
      vpc: this.vpc
    })
    this.deleteTravelRecordLambda = new nodeLambda.NodejsFunction(scope, 'deleteTravelRecordLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelRecordLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travelRecord/deleteTravelRecord.ts'),
      vpc: this.vpc
    })
    this.deleteTravelRecordByIdLambda = new nodeLambda.NodejsFunction(scope, 'deleteTravelRecordByIdLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelRecordByIdLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travelRecord/travelRecordId/deleteTravelRecordById.ts'),
      vpc: this.vpc
    })

    this.postTravelLambda = new nodeLambda.NodejsFunction(scope, 'postTravelLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'postTravelLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travel/createTravel.ts'),
      vpc: this.vpc
    })
    this.deleteTravelLambda = new nodeLambda.NodejsFunction(scope, 'deleteTravelLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travel/deleteTravel.ts'),
      vpc: this.vpc
    })
    this.deleteTravelByIdLambda = new nodeLambda.NodejsFunction(scope, 'deleteTravelByIdLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelByIdLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travel/travelId/deleteTravelById.ts'),
      vpc: this.vpc
    })
    this.getTravelByIdLambda = new nodeLambda.NodejsFunction(scope, 'getTravelByIdLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'getTravelByIdLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/travel/travelId/getTravelById.ts'),
      vpc: this.vpc
    })
    this.postPhotoLambda = new nodeLambda.NodejsFunction(scope, 'postPhotoLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'postPhotoLambda',
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/photo/createPhoto.ts'),
      vpc: this.vpc
    })
    this.uploadPhotoDataLambda = new nodeLambda.NodejsFunction(scope, 'uploadPhotoLambda', {
      bundling: {
        externalModules: ['@aws-sdk/client-s3']
      },
      functionName: 'uploadPhotoDataLambda',
      runtime: lambda.Runtime.NODEJS_16_X,
      layers: [this.nodeLayer],
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/photoData/uploadPhotoData.ts'),
      environment: {
        BUCKET_NAME: 'phoquash-photo-data-bucket'
      }
    })
  }
}
