import { Container } from 'inversify';
import { interfaces, TYPE } from 'inversify-express-utils';
import { APIController } from './controller';
import { BlockChain } from './blockchain';

export class AppContainer extends Container {
    constructor() {
        super();

        APIController



        this.bindService([
        ])

        this.bindComponentsInSingleton([
            BlockChain
        ])

    }

    private bindService(services: any[]) {
        services.forEach((service) => {
            this.bind((service.name)).to(service).inSingletonScope();
        });
    }
    private bindComponentsInSingleton(components: any[]) {
        components.forEach((component) => {
            this.bind((component.name)).to(component).inSingletonScope()
        })
    }
}


