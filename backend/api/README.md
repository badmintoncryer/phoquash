## openAPIによるAPIスキーマ管理

### 環境構築
1. [openapi-generator](https://github.com/OpenAPITools/openapi-generator)のインストール
   1. macの場合、brewでインストール
   ```$ brew install openapi-generator```
   2. その他は[公式参照](https://github.com/OpenAPITools/openapi-generator#1---installation)

### 手順
1. openapi.yamlの作成
   1. [openAPI3.0形式](https://swagger.io/specification/)に則って作成する。
      1. tags, OperationIdも適切に設定し、自動生成時のAPI class, 関数名をいい感じにする。
      2. 参考URLは[こちら](https://zenn.dev/offers/articles/20220620-openapi-generator)
   2. API Gatewayから既存APIのエクスポートが可能。原型はここから作るのがおすすめ。
      1. 公式マニュアルは[こちら](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-export-api.html)
      2. パラメータ群までは読み取ってくれないため、手動で修正が必要。いい感じの方法を模索してみる。
2. openapi-generatorを用いたクライアントコード生成
   1. ```$ openapi-generator generate -g <出力形式> -i <openapi.yamlへのpath> -o <出力先フォルダへのpath>```
   2. ex. ```$ openapi-generator generate -g typescript-axios -i ./backend/api/openapi.yaml -o ./backend/api/typescript-axios```



