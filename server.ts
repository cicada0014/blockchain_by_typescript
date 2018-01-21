import 'reflect-metadata';
import { Container } from 'inversify';
import { interfaces, controller, InversifyExpressServer, TYPE } from 'inversify-express-utils';
import * as express from 'express';
import { APIController } from './controller';
import { BlockChain } from './blockchain';
import { AppContainer } from './container';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as morgan from 'morgan';



export class Server {
    private app: express.Application;
    private container: AppContainer;
    private PORT: string | number = process.env.PORT || 3005;
    private server: InversifyExpressServer;
    constructor() {
        this.container = new AppContainer();
        this.server = new InversifyExpressServer(this.container);
        this.server.setConfig((app) => {
            this.onMountingMiddleWare(app);
        });
        this.app = this.server.build();
        this.app.listen(this.PORT, () => {
            console.log(`Listening at http://localhost:${this.PORT}/`);
        });
    }
    public onMountingMiddleWare(app: express.Application) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(helmet());
        app.use(morgan('combined'));
        this.container.get<BlockChain>('BlockChain').init();
    };
    public static bootstrap(): Server { return new Server() }
}
// 서버시작
Server.bootstrap();