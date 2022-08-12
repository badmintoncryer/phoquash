# phoquash

お手軽旅行記録作成アプリ

[![deploy cdk](https://github.com/badmintoncryer/phoquash/actions/workflows/cdk-deploy.yaml/badge.svg)](https://github.com/badmintoncryer/phoquash/actions/workflows/cdk-deploy.yaml)
[![Code Scanning CDK - Action](https://github.com/badmintoncryer/phoquash/actions/workflows/code-scanning-cdk.yaml/badge.svg)](https://github.com/badmintoncryer/phoquash/actions/workflows/code-scanning-cdk.yaml)
[![Code Scanning Frontend - Action](https://github.com/badmintoncryer/phoquash/actions/workflows/code-scanning-frontend.yaml/badge.svg)](https://github.com/badmintoncryer/phoquash/actions/workflows/code-scanning-frontend.yaml)

# 開発環境起動方法

```
REACT_APP_AWS_PROJECT_REGION=ap-northeast-1 REACT_APP_AWS_COGNITO_REGION=ap-northeast-1 REACT_APP_AWS_USER_POOLS_ID={userPoolId} REACT_APP_AWS_USER_POOLS_CLIENT_ID={userPoolClientId} HTTPS=true yarn start
```
