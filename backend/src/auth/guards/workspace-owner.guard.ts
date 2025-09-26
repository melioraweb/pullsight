import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable
} from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
    constructor(private readonly dataService: DatabaseService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const user = request.user

        const userData: any = await this.dataService.users
            .findOne({ _id: user.sub })
            .populate({
                path: 'currentWorkspace',
                select: 'ownerId'
            })

        if (!userData?.currentWorkspace) {
            throw new ForbiddenException('User or workspace context missing')
        }

        if (!(user.sub === userData.currentWorkspace?.ownerId?.toString())) {
            throw new ForbiddenException('You are not the workspace owner')
        }
        return true
    }
}
