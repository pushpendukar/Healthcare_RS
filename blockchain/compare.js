const axios = require('axios');

async function fetchFileContent(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching file:', error.message);
        return null;
    }
}

// async function compareFiles(server1Url, server2Url) {
//     const [content1, content2] = await Promise.all([
//         fetchFileContent(server1Url),
//         fetchFileContent(server2Url)
//     ]);

//     if (content1 === null || content2 === null) {
//         console.log('Failed to fetch file content from one or both servers.');
//         return;
//     }

//     if (content1 === content2) {
//         console.log('The content of "1.txt" is the same on both servers.');
//     } else {
//         console.log('The content of "1.txt" is different on the servers.');
//     }
// }

// 用实际的服务器 URL 替换以下占位符
const server1Url = 'http://47.102.152.210/root/blockchain/doctorFeedback.txt';
// const server2Url = 'http://server2.example.com/root/blockchain/doctorFeedback.txt';

// compareFiles(server1Url, server2Url);
console.log(fetchFileContent(server1Url));