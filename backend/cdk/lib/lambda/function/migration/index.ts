import { Context, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import path = require('path')
import * as childProcess from 'child_process'

enum Status {
  Success,
  Failed
}

exports.handler = async (_event: APIGatewayProxyEventV2WithJWTAuthorizer, _context: Context): Promise<void> => {
  const exitCode = await new Promise((resolve, _reject) => {
    childProcess.execFile(
      path.resolve('./node_modules/prisma/build/index.js'),
      ['migrate', 'deploy'],
      {
        env: {
          ...process.env
        }
      },
      (error, stdout, _stderr) => {
        console.log(stdout)
        if (error != null) {
          console.log(`prisma migrate deploy exited with error ${error.message}`)
          resolve(error.code ?? Status.Failed)
        } else {
          resolve(Status.Success)
        }
      }
    )
  }).catch((error) => {
    console.log(error)
    throw new Error(`migration is failed`)
  })

  if (exitCode !== Status.Success) {
    throw Error(`migration failed with exit code ${exitCode}`)
  }
}
