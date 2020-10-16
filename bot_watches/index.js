const puppeteer = require('puppeteer');
const fs = require('fs');
let browser;
let productLinks = [];

fs.createWriteStream('productslinks1.json');

const urls = [
    'https://www.bobswatches.com/usearch?query=&submit.x=19&submit.y=14'
];

const scraper = () => new Promise(async (resolve, reject) => {

    try {
        console.log('Bot initiated...');
        browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
            ]
        });
        await getProductsUrls();
        console.log(`Number of Products Links found: ${productLinks.length}`);
        // for (let i = 0; i < productsLinks.length; i++) {
        //     console.log(`Link ${i + 1}/ ${productsLinks.length}`);    
        //   }
        await browser.close();
        console.log('Bot finished...');
        resolve();
    } catch (error) {
        if (browser) await browser.close();
        console.log(`Error: ${error}`);
        reject(error);
    }
});

const getProductsUrls = () => new Promise(async (resolve, reject) => {
    let page;
    try {
        console.log(`Fetching products urls...`);
        page = await browser.newPage();

        for (let urlIdx = 0; urlIdx < urls.length; urlIdx++) {
            console.log(`${urlIdx +1}/${urls.length} => Fetching products urls from [${urls[urlIdx]}]`);
            await page.goto(urls[urlIdx], {
                timeout: 0,
                waitUntil: 'networkidle2'
            });
            await page.waitForSelector('.categoryPaginationWrapper .categoryPaginationContainer .categoryPaginationButtonNext > a');
            // await page.waitForSelector('.categoryPaginationWrapper .categoryPaginationContainer>div> div:last-child>a');
            //let pageNumber=1;
            let nextButton;
            do {
                await page.waitForSelector('.itemResults');
                const pageLinks = await page.$$eval('.itemResults .itemWrapper .itemimage > a', elms => elms.map(elm => elm.getAttribute('href')));
                productLinks.push(...pageLinks);
                nextButton = await page.$('.categoryPaginationWrapper .categoryPaginationContainer  .categoryPaginationButtonNext > a');
                //nextButton= await page.$('.categoryPaginationWrapper .categoryPaginationContainer>div> div:last-child>a');
                if (nextButton) await nextButton.click();
            } while (nextButton);

            fs.writeFileSync('productslinks1.json', JSON.stringify(productLinks));
        }

        await page.close();
        console.log(`Page Links scraped...`);
        resolve();
    } catch (error) {
        if (browser) await browser.close();
        console.log(`Error: ${error}`);
        reject(error);
    }
})


scraper();











// const numberOfPages= await page.$eval('.categoryPaginationContainer .categoryPaginationPages .categoryPaginationButton .categoryPaginationButtonNext', elms=> elms.map(elm=> elm.getAttribute()))
// const pageLinks= await page.evaluate(async selector => {
//     const delay = (delayInms) => new Promise(resolve => setTimeout(() => resolve(), delayInms));
//     window.scrollTo(0, document.body.scrollHeight - 1200);
//     let moreButton= document.querySelector('.categoryPaginationContainer .categoryPaginationPages .categoryPaginationButton .categoryPaginationButtonNext');
//     let pageNumber=1;
//     while(moreButton){
//         console.log(`Loading page: ${pageNumber}`);
//         pageNumber++;
//         moreButton.click();
//         await delay(5000);
//         window.scrollTo(0, document.body.scrollHeight-1200);
//         await delay(5000);
//         moreButton=document.querySelector('.categoryPaginationContainer .categoryPaginationPages .categoryPaginationButton .categoryPaginationButtonNext');

//     }
//     let links=[];
//     let productNodes=document.querySelectorAll(selector);

// })


// const pageLinks = await page.$$eval('.itemResults .itemWrapper .itemimage > a', elms => elms.map(elm => elm.getAttribute('href')));
//             productLinks.push(...pageLinks);
//             fs.writeFileSync('productslinks.json', JSON.stringify(productLinks));
