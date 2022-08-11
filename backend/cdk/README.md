# Phoquash CDK

## 構成

CDKによるインフラ構築 + PrismaによるSQLレスなクエリ生成

## 開発手順

1. schema.prismaを修正し、テーブルスキーマを記述する
2. ```$ prisma generate``` によりprisma clientを生成する
3. ```$ cdk deploy```によりリソースのデプロイを行う
4. テーブルスキーマの修正を行った場合、migrationLambdaをinvokeし、prisma migrationを行う

   ```
   aws lambda invoke --function-name migrationLambda --profile <profileName> out.json
   ```

This is a blank project for CDK development with TypeScrip

he `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
