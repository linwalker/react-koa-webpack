const puppeteer = require('puppeteer');
const num_index = {
  'numberone': 1,
  'numbertwo': 2,
  'numberthree': 3,
  'numberfour': 4,
  'numberfive': 5,
  'numbersix': 6,
  'numberseven': 7,
  'numbereight': 8,
  'numbernine': 9,
  'numberzero': 0,
  'numberdor': '.'
}
let house_result = [];
function numProcessor(td_str) {
  if (!td_str) return '--';
  try {
    const span_array = td_str.split('</span>');
    const en_result = [];
    span_array.forEach(element => {
      const index = element.indexOf('<span');
      if (index !== -1) {
        const num_str = element.substring(index + 13, element.indexOf('">', index));
        en_result.push(num_str);
      }
    });
    const num_result = en_result.map((element, index) => {
      return num_index[element]
    }).join('');
    return num_result;
  } catch (e) {
    console.log(e);
    return '--';
  }
}
async function getPageData(page) {
  const aHandle = await page.evaluateHandle(() => document.querySelectorAll('.sjtd')[1]);
  const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
  const tbody_html = await resultHandle.jsonValue()
  await resultHandle.dispose();
  const house_array = [];
  let tr_array = tbody_html.split('</tr>');

  for (let i = 0, len = tr_array.length - 1; i < len; i++) {
    let house_item = {};
    const td_array = tr_array[i].split('</td>');
    // 楼幢
    const build_num = td_array[0].substring(td_array[0].indexOf('_blank">') + 8, td_array[0].indexOf('幢'));
    // 房间
    const room_num = td_array[1].substring(td_array[1].indexOf('<div>') + 5, td_array[1].indexOf('室'));
    // 建筑面积
    const build_area = numProcessor(td_array[2]);
    // 套内建筑面积
    const room_area = numProcessor(td_array[3]);
    // 得房率
    const ratio = numProcessor(td_array[4]);
    // 毛皮单价
    const blank_price = numProcessor(td_array[5]);
    // 装修价
    const decoration_price = numProcessor(td_array[6]);
    // 总价
    const total_price = numProcessor(td_array[7]);
    house_item = { build_num, room_num, build_area, room_area, ratio, blank_price, decoration_price, total_price };
    house_array.push(house_item);
  }
  console.log(house_array);
  return house_array;
}
async function getPageNum(page) {
  const spanHandle = await page.evaluateHandle(() => document.querySelector('div.spagenext > span'));
  const result_span_handle = await page.evaluateHandle(body => body.innerHTML, spanHandle);
  const span_html = await result_span_handle.jsonValue();
  await result_span_handle.dispose();
  const page_index = span_html.indexOf('/');
  const total_page = span_html.substring(page_index + 1, page_index + 4);
  const current_page = span_html.substring(span_html.indexOf('页数') + 2, page_index);
  return [parseInt(current_page), parseInt(total_page)];
}
async function autoGetPageData(page) {
  await page.waitForSelector('#presell_all');
  console.log('before wait');
  await page.waitForFunction('document.querySelectorAll(".sjtd").length > 1');
  console.log('after wait'); 
  const current_page_data = await getPageData(page);
  const page_navigation = await getPageNum(page);
  house_result = house_result.concat(current_page_data);
  const current_page = page_navigation[0];
  const total_page = page_navigation[1];
  console.log('current page', current_page);
  if (current_page < total_page) {
    await page.click('div.spagenext > a:last-child');
    await autoGetPageData(page)
  }

}
async function init(){
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('http://www.tmsf.com/newhouse/presell_330184_292222382_12460795.htm');
  await page.waitForSelector('#presell_all');
  // await page.click('#presell_all');
  await autoGetPageData(page);
}
init();