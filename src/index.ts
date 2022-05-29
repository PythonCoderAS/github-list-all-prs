import { run } from "@oclif/core";
import { handle } from "@oclif/core/lib/errors/handle";

run().catch((error) => handle(error));
