const { delimiter } = require('path')
const Blockchain = require('./Blockchain')
const Table = require('cli-table')

const vorpal = require('vorpal')()
const blockchain = new Blockchain()


function formatLog(data) {
    if (!Array.isArray(data)) {
        data = [data]
    }
    const first = data[0]
    const head = Object.keys(first)

    instantiate
    const table = new Table({
        head: head
        , colWidths: new Array(head.length).fill(20)
    })

    const res = data.map(v => {
        return head.map(h => JSON.stringify(v[h]))
    })


    table.push(...res)

    console.log(table.toString());
}

vorpal
    .command('mineToAddInfo <username> <name> <password> <email>', '添加User信息')
    .action(function (args, callback) {
        let trans = blockchain.mineToAddInfo(args.username, args.name, args.password, args.email)
        if (trans) {
            // formatLog(trans)
            console.log(trans);
        }
        callback()
    })

vorpal
    .command('mineToAddComment <name> <comment>', '添加User评论')
    .action(function (args, callback) {
        let trans = blockchain.mineToAddComment(args.name, args.comment)
        if (trans) {
            // formatLog(trans)
            console.log(trans);
        }
        callback()
    })

vorpal
    .command('detail  <index>', '查看区块详情')
    .action(function (args, callback) {
        const block = blockchain.blockchain[args.index]
        this.log(JSON.stringify(block, null, 2))
        callback()
    })


// vorpal
//     .command('mine  <address>', '挖矿')
//     .action(function (args, callback) {
//         const newBlock = blockchain.mine(args.address)
//         if (newBlock) {
//             // formatLog(newBlock)
//             console.log(newBlock)
//         }
//         callback()
//     })

// vorpal
//     .command('blance  <address>', '查余额')
//     .action(function (args, callback) {
//         const blance = blockchain.blance(args.address)
//         if (blance) {
//             formatLog({
//                 blance, address: args.address
//             })
//         }
//         callback()
//     })

vorpal
    .command('chain', '查看区块链')
    .action(function (args, callback) {
        // formatLog(blockchain.blockchain)
        console.log(blockchain.blockchain)
        callback()
    }
    )

console.log('hello')
vorpal.exec('help')

vorpal
    .delimiter("test chain =>")
    .show()

