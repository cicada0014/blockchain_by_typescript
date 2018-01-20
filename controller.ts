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
            let lastBlock = this.blockChain.lastBlock();
            let lastProof = lastBlock.proof;
            let proof = this.blockChain.proofOfWork(lastProof);

            this.blockChain.newTransaction(0, uuid.v4().replace('-', ''), 1);

            let previousHash = this.blockChain.hash(lastBlock);
            let block = this.blockChain.newBlock(previousHash, proof)

            let _response = {
                message: 'new block forged',
                index: block.index,
                transactions: block.transactions,
                proof: block.proof,
                previous_hash: block.previousHash
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

            let index = this.blockChain.newTransaction(req.body['sender'], req.body['recipient'], req.body['amount'])

            res.status(200).send({ message: `Transaction will be added to Block ${index}` })
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



    @httpPost('/nodes/register')
    public registerNodes( @request() req, @response() res) {
        let nodes: Array<any> = req.body.nodes

        if (!nodes || nodes.length == 0) {
            res.status(400).send('Error: please supply a valid list of nodes')
            return
        }

        nodes.forEach(node => {
            this.blockChain.registerNode(node)
        })

        res.send({
            message: 'New nodes have been added',
            total_nodes: Array.from(this.blockChain.nodes)
        })

    }

    @httpGet('/nodes/resolve')
    public resolveNodes( @request() req, @response() res) {
        let replaced = this.blockChain.resolveConfilcts();
        let response
        if (replaced) {
            response = {
                message: 'Our chain was replaced',
                new_chain: this.blockChain.chain
            }
        } else {
            response = {
                message: 'Our chain is authoritative',
                chain: this.blockChain.chain
            }
        }

        res.send(response)
    }






}