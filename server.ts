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
        // this.mysqlcon = new MysqlConnection();
        // this.conversationFactory = new ConversationFactory(this.mysqlcon);
        // this.messageHandler = new MessageHandler(this.conversationFactory);
        // 특정시간에 어떤 작업을 내릴 수가 있다. 
        //보안을 위한 헬멧 라이브러리 사용 response http header 설정 
        // defulat로 적용된 방어 내용
        // 플래쉬 컨텐츠 방어, X-Powered-by header (서버의 정보 예를들어 몇버전의 어떤 서버인지를 알려주는 정보임) 를 없앰 , 
        // HSTS support(이 서버는 HTTPS로만 사용하는 사이트임을 브라우저에게 알리는 헤더) , Clickjacking 방어, XSS 방어 
        // 외부 사이트에서 iframe 내부에 이 사이트 사용 불가 
        app.use(helmet());
        app.use(morgan('combined'));
        this.container.get<BlockChain>('BlockChain').init();
        // if (!(process.env.NODE_ENV == 'dev')) {
        //     app.all('/*', (req: express.Request, res: express.Response, next) => {
        //         // X-Forwarded 헤더는 요청의 근원지를 파악한다.
        //         if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
        //             res.redirect('https://' + req.hostname);
        //         } else {
        //             next();
        //         }
        //     });


        // }





    };

    public static bootstrap(): Server { return new Server() }




}




// 서버시작

Server.bootstrap();