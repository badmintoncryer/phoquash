# Phoquash CDK

## 構成

CDKによるインフラ構築 + PrismaによるSQLレスなクエリ生成

## 開発手順

1. schema.prismaを修正し、テーブルスキーマを記述する
2. ```$ prisma generate``` によりprisma clientを生成する
3. ```$ cdk deploy```によりリソースのデプロイを行う
   - このとき、dokcerによるtsファイルのトランスパイル&バンドルが行われるが、[macOS上では異常に動作が遅い](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#local-bundling)ので注意。
   - docker Desktopを導入できない場合、vagrantなどでVMを立ててその中でdokcerを動かす。ここで、esbuildインストールした際のバイナリが[OSに依存するため](https://github.com/evanw/esbuild/issues/642)、mac上でインストールしたesbuildをVM上で動作させることができない(逆もしかり)。したがって、```npm install```や```cdk deploy```は<span style="color: red; ">すべてVM上で行う</span>ことに注意する。
     - 15分位かかるが気長に待つ。
4. テーブルスキーマの修正を行った場合、migrationLambdaをinvokeし、prisma migrationを行う

   ```
   aws lambda invoke --function-name migrationLambda --profile <profileName> out.json
   ```

This is a blank project for CDK development with TypeScrip

he `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build`   compile typescript to js
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `cdk deploy`      deploy this stack to your default AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
