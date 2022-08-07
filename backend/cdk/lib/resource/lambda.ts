import { Construct } from 'constructs'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as path from 'path'

const MOUNT_PATH = '/mnt/db'

export interface DatabaseConnectionProps {
  host: string
  port: string
  engine: string
  username: string
  password: string
}

interface PrismaFunctionProps extends nodeLambda.NodejsFunctionProps {
  database?: DatabaseConnectionProps
}

class PrismaFunction extends nodeLambda.NodejsFunction {
  constructor(scope: Construct, id: string, props: PrismaFunctionProps) {
    super(scope, id, {
      ...props,
      environment: {
        DATABASE_HOST: props.database?.host || '',
        DATABASE_PORT: props.database?.port || '',
        DATABASE_ENGINE: props.database?.engine || '',
        DATABASE_USER: props.database?.username || '',
        DATABASE_PASSWORD: props.database?.password || ''
      },
      bundling: {
        externalModules: ['sqlite3'],
        nodeModules: ['@prisma/client'].concat(props.bundling?.nodeModules ?? []),
        commandHooks: {
          beforeInstall: (inputDir: string, outputDir: string) => [
            // Copy prisma directory to Lambda code asset
            // the directory must be located at the same directory as your Lambda code
            `cp -r ${inputDir}/prisma ${outputDir}`
          ],
          beforeBundling: (_inputDir: string, _outputDir: string) => [],
          afterBundling: (_inputDir: string, _outputDir: string) => []
        }
      },
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler'
    })
  }
}

export class Lambda {
  public createDbLambda: lambda.Function
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

    this.createDbLambda = new nodeLambda.NodejsFunction(scope, 'createDb', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/createDb/index.ts'),
      vpc: this.vpc
    })

    this.postUserLambda = new PrismaFunction(scope, 'postUser', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      layers: [this.nodeLayer],
      entry: path.join(__dirname, '../lambda/function/user/createUser.ts'),
      vpc: this.vpc
    })
    // this.postUserLambda = new nodeLambda.NodejsFunction(scope, 'postUser', {
    //   bundling: {
    //     externalModules: ['sqlite3']
    //   },
    //   filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
    //   layers: [this.nodeLayer],
    //   runtime: lambda.Runtime.NODEJS_16_X,
    //   handler: 'handler',
    //   entry: path.join(__dirname, '../lambda/function/user/createUser.ts'),
    //   vpc: this.vpc
    // })
    this.deleteUserLambda = new nodeLambda.NodejsFunction(scope, 'deleteUser', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/user/deleteUser.ts'),
      vpc: this.vpc
    })
    this.deleteUserByIdLambda = new nodeLambda.NodejsFunction(scope, 'deleteUserById', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      layers: [this.nodeLayer],
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/user/userId/deleteUserById.ts'),
      vpc: this.vpc
    })
    this.getUserByIdLambda = new nodeLambda.NodejsFunction(scope, 'getUserById', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
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
