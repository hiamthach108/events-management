import { PingModule } from "./ping/ping.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { EventModule } from "./event/event.module";

export const modules = [PingModule, UserModule, AuthModule, EventModule];
