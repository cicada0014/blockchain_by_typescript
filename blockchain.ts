import { injectable, inject } from "inversify";
import * as crypto from 'crypto';


export interface Transaction {
    sender: any,
    recipient: any,
    amount: any
}

export interface Block {
    index: number,
    timestamp: number,
    transactions: Array<Transaction>,
    proof: any,
    previousHash: any,
}


@injectable()
export class BlockChain {
    chain: Array<Block> = [];
    currentTransactions: Array<Transaction> = [];
    // 해시가 한번만 생성된다...? 문서 읽어바야겟네.
    // sha256 = crypto.createHash('sha256');
    init() {
        // genesis block
        this.newBlock(1, 100)
    }


    newBlock(previousHash, proof) {

        let _block: Block = {
            index: this.chain.length + 1,
            timestamp: new Date().getTime(),
            transactions: this.currentTransactions,
            proof: proof,
            previousHash: previousHash ? previousHash : this.hash(this.chain[-1])
        }

        this.currentTransactions = [];
        this.chain.push(_block);
        return _block;

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
        return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex')

    }

    proofOfWork(lastProof) {
        let _proof = 0;

        while (!this.validProof(lastProof, _proof)) {
            _proof++;
        }
        return _proof;
    }

    validProof(lastProof, proof) {
        let guess = lastProof * proof;
        let guessHash = crypto.createHash('sha256').update(guess.toString()).digest('hex');
        return guessHash.slice(guessHash.length - 4) === "0000";
    }


    lastBlock() {
        return this.chain[this.chain.length - 1];
    }

}