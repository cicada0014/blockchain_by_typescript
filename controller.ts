import { injectable, inject } from "inversify";
import { NextFunction, Request, Response, Router } from "express";
import { controller, httpGet, httpPost, httpPut, httpDelete, request, response } from 'inversify-express-utils';
import { BlockChain } from "./blockchain";
import * as uuid from 'uuid'


@controller('/api')
export class APIController {





    constructor(
        @inject('BlockChain') private blockChain: BlockChain

    ) {

    }

    @httpGet('/mine')
    public mineBlock( @request() req, @response() res) {
        try {
            let _lastBlock = this.blockChain.lastBlock();
            let _lastProof = _lastBlock.proof;
            let _proof = this.blockChain.proofOfWork(_lastProof);

            this.blockChain.newTransaction(0, uuid.v4().replace('-', ''), 1);

            let _previousHash = this.blockChain.hash(_lastProof);
            let _block = this.blockChain.newBlock(_previousHash, _proof)

            let _response = {
                message: 'new block forged',
                index: _block.index,
                transactions: _block.transactions,
                proof: _block.proof,
                previous_hash: _block.previousHash
            }

            res.send(_response)
        } catch (e) {
            console.log(e);
            res.status(500).send(e)
        }

    }
    @httpPost('/transactions')
    public newBlock( @request() req, @response() res) {
        console.log(req.body.sender)
        try {
            if (!req.body['sender'] || !req.body['recipient'] || !req.body['amount']) {
                res.status(400).send('missing values');
                return
            }

            let _index = this.blockChain.newTransaction(req.body['sender'], req.body['recipient'], req.body['amount'])

            res.status(200).send({ message: `Transaction will be added to Block ${_index}` })
        } catch (e) {
            console.log(e)
            res.status(500).send();
        }


        // curl  -X POST http:/localhost:3005/api/transactions -H "Content-Type:application/json" -d '{"sender":"joy","recipient":1234,"amount":1000}'
    }
    @httpGet('/chain')
    public fullChain( @request() req, @response() res) {
        res.send({
            chain: this.blockChain.chain,
            length: this.blockChain.chain.length

        })
    }







}