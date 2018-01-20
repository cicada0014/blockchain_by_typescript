import { injectable, inject } from "inversify";
import * as crypto from 'crypto';
import * as URL from 'url-parse';
import * as request from 'request';
export interface Transaction {
    sender: string,
    recipient: string,
    amount: number
}

export interface Block {
    index: number,
    timestamp: number,
    transactions: Array<Transaction>,
    proof: number,
    previousHash: string,
}


@injectable()
export class BlockChain {
    nodes: Set<any> = new Set();
    chain: Array<Block> = [];
    currentTransactions: Array<Transaction> = [];
    // 해시가 한번만 생성된다...? 문서 읽어바야겟네.

    init() {
        // genesis block
        this.newBlock('1', 100)
    }


    newBlock(previousHash: string, proof: number) {

        let block: Block = {
            index: this.chain.length + 1,
            timestamp: new Date().getTime(),
            transactions: this.currentTransactions,
            proof: proof,
            previousHash: previousHash ? previousHash : this.hash(this.chain[this.chain.length - 1])
        }

        this.currentTransactions = [];
        this.chain.push(block);
        return block;

    }

    newTransaction(sender, recipient, amount) {
        this.currentTransactions.push({
            sender: sender,
            recipient: recipient,
            amount: amount
        })
        return this.lastBlock().index + 1;
    }

    hash(block: Block) {
        return crypto.createHash('sha256').update(JSON.stringify(block, Object.keys(block).sort())).digest('hex')

    }

    proofOfWork(lastProof) {
        let proof = 0;

        while (!this.validProof(lastProof, proof)) {
            proof++;
        }
        return proof;
    }

    validProof(lastProof, proof) {
        let guess = lastProof * proof;
        let guessHash = crypto.createHash('sha256').update(guess.toString()).digest('hex');
        return guessHash.slice(guessHash.length - 4) === "0000";
    }


    lastBlock() {
        return this.chain[this.chain.length - 1];
    }


    registerNode(address) {
        let parsed = URL(address, true);
        this.nodes.add(parsed.href)
    }

    validChain(chain: Array<Block>) {
        let lastBlock = chain[0]
        let currentIndex = 1;

        while (currentIndex < chain.length) {
            let block = chain[currentIndex];
            console.log(lastBlock)
            console.log(block)
            console.log('\n --------- \n')


            if (block.previousHash != this.hash(lastBlock)) {
                return false
            }

            if (!this.validProof(lastBlock.proof, block.proof)) {
                return false
            }

            lastBlock = block;
            currentIndex++;


        }
        return true
    }

    async   resolveConfilcts() {
        let neighbours = Array.from(this.nodes);
        let newChain;
        let maxLength = this.chain.length;

        for (let i in neighbours) {
            await new Promise<any>((resolve, reject) => {
                request.get(`${neighbours[i]}/api/chain`, (error, resp, body) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(resp)
                })
            }).then(response => {
                if (response.statusCode == 200) {
                    let body = JSON.parse(response.body);
                    let length = body.length;
                    let chain = body.chain
                    if (length > maxLength && this.validChain(chain)) {
                        maxLength = length;
                        newChain = chain
                    }
                }
            })
        }
        console.log("resolve complete")
        if (newChain) {
            this.chain = newChain;
            return true
        }
        return false
    }

}