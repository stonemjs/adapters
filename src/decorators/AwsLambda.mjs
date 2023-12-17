import { Adapter } from './Adapter.mjs'
import { AWS_LAMBDA_PLATFORM } from '../constants.mjs'

/**
 * AwsLambda Decorator: Useful for customizing classes to ensure applications run smoothly on AWS Lambda FAAS.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @memberOf Decorators
 * @param  {adapterOptions} options
 * @return {Function}
 */
export const AwsLambda = (options) => {
  return Adapter({ ...options, current: AWS_LAMBDA_PLATFORM })
}
