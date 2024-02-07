import {
  Code,
  Function,
  FunctionUrl,
  FunctionUrlAuthType,
  InvokeMode,
  Runtime,
  SnapStartConf,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path";
import {
  BaseNessieService,
  BaseNessieServiceProps,
} from "./base-nessie-service";

export interface NessieLambdaServiceProps extends BaseNessieServiceProps {}

export class NessieLambdaService extends BaseNessieService {
  public readonly function: Function;
  public readonly functionUrl: FunctionUrl;

  public override readonly serviceUrl: string;

  constructor(scope: Construct, id: string, props?: NessieLambdaServiceProps) {
    super(scope, id, props);

    // TODO: none of this is right
    // see: https://project-nessie.zulipchat.com/#narrow/stream/371187-general/topic/AWS.20Lambda.20with.20SnapStart
    this.function = new Function(this, "Function", {
      runtime: Runtime.JAVA_17,
      snapStart: SnapStartConf.ON_PUBLISHED_VERSIONS,
      code: Code.fromAsset(path.join(__dirname, "lambda")),
      handler:
        "io.quarkus.amazon.lambda.runtime.QuarkusStreamHandler::handleRequest",
    });
    this.functionUrl = this.function.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
      // TODO: what's right here? Maybe streaming?
      invokeMode: InvokeMode.BUFFERED,
    });
    this.serviceUrl = this.functionUrl.url;
  }
}
