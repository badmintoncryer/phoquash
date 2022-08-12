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
        DATABASE_PASSWORD: props.database?.password || '',
        PRISMA_QUERY_ENGINE_LIBRARY: './node_modules/'
      },
      bundling: {
        nodeModules: ['@prisma/client', 'prisma'],
        forceDockerBundling: false,
        // nodeModules: ['prisma'].concat(props.bundling?.nodeModules ?? []),
        commandHooks: {
          beforeInstall: (inputDir: string, outputDir: string) => [
            // Copy prisma directory to Lambda code asset
            // the directory must be located at the same directory as your Lambda code
            `cp -r ${inputDir}/prisma ${outputDir}`
          ],
          beforeBundling: (_inputDir: string, _outputDir: string) => [],
          afterBundling: (inputDir: string, outputDir: string) => [
            // prisma動作に必要なschema, engineをlambdaのhomeディレクトリにコピー
            `cp ${inputDir}/prisma/schema.prisma ${outputDir}`,
            `cp ${inputDir}/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node ${outputDir}`,
            `cp -r ${inputDir}/node_modules/.prisma/client ${outputDir}/node_modules/.prisma`,
            // lambdaの容量制限対策
            `rm -rf ${outputDir}/node_modules/@prisma/engines`,
            `rm -f ${outputDir}/node_modules/prisma/*engine*`
          ]
        }
      },
      timeout: Duration.minutes(1),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'handler'
    })
  }
}

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
  public getUsersLambda: lambda.Function
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
    // migrationにはnode_modules/@prisma, prismaのいずれのパッケージがすべて必要だったため、
    // lambdaの容量制限を回避すべくDockerコンテナ型のlambdaとした。
    // その他queryのみ行うlambdaは@prismaから不要なengineを削除することでlambdaの容量制限を回避できるため、
    // nodejsFunctionを用いている。
    // this.migrationLambda = new DockerPrismaFunction(scope, 'migration', {
    //   code: DockerImageCode.fromImageAsset('./'),
    //   memorySize: 256,
    //   timeout: Duration.minutes(5),
    //   filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
    //   functionName: 'migrationLambda',
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
    this.getUsersLambda = new PrismaFunction(scope, 'getUsers', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'getUsersLambda',
      entry: path.join(__dirname, '../lambda/function/user/getUsers.ts'),
      vpc: this.vpc
    })
    this.deleteUserByIdLambda = new PrismaFunction(scope, 'deleteUserById', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteUserByIdLambda',
      entry: path.join(__dirname, '../lambda/function/user/userId/deleteUserById.ts'),
      vpc: this.vpc
    })
    this.getUserByIdLambda = new PrismaFunction(scope, 'getUserById', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteUserByIdLambda',
      entry: path.join(__dirname, '../lambda/function/user/userId/getUserById.ts'),
      vpc: this.vpc
    })
    this.postTravelRecordLambda = new PrismaFunction(scope, 'postTravelRecordLambda', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'postTravelRecordLambda',
      entry: path.join(__dirname, '../lambda/function/travelRecord/createTravelRecord.ts'),
      vpc: this.vpc
    })
    this.deleteTravelRecordLambda = new PrismaFunction(scope, 'deleteTravelRecordLambda', {
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelRecordLambda',
      entry: path.join(__dirname, '../lambda/function/travelRecord/deleteTravelRecord.ts'),
      vpc: this.vpc
    })
    this.deleteTravelRecordByIdLambda = new nodeLambda.NodejsFunction(scope, 'deleteTravelRecordByIdLambda', {
      bundling: {
        externalModules: ['sqlite3']
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(this.accessPoint, MOUNT_PATH),
      functionName: 'deleteTravelRecordByIdLambda',
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
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
      // layers: [this.nodeLayer],
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/function/photoData/uploadPhotoData.ts'),
      environment: {
        BUCKET_NAME: 'phoquash-photo-data-bucket'
      }
    })
  }
}
