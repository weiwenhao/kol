'use strict';

const Controller = require('egg').Controller;
const IgApiClient = require('instagram-private-api').IgApiClient;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async ins() {
    const ig = new IgApiClient();
    ig.state.generateDevice('ay1101140857@gmail.com');
    ig.state.proxyUrl = 'http://127.0.0.1:1085';

    function fakeSave(data) {
      // here you would save it to a file/database etc.
      // you could save it to a file: writeFile(path, JSON.stringify(data))
      // console.log(data);
      return data;
    }

    function fakeExists() {
      // here you would check if the data exists
      return true;
    }

    function fakeLoad() {
      // here you would load the data
      return {
        cookies: '{"version":"tough-cookie@2.5.0","storeType":"MemoryCookieStore","rejectPublicSuffixes":true,"cookies":[{"key":"csrftoken","value":"OKJE4hg2C8TXnA5rIXwawPbTCx2K4en8","expires":"2021-07-22T07:32:38.000Z","maxAge":31449600,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2020-07-23T07:32:36.245Z","lastAccessed":"2020-07-23T07:32:38.524Z"},{"key":"rur","value":"VLL","domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-07-23T07:32:36.247Z","lastAccessed":"2020-07-23T07:32:38.525Z"},{"key":"mid","value":"Xxk9FAABAAH6dIgpl6cHogR1mduA","expires":"2030-07-21T07:32:36.000Z","maxAge":315360000,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2020-07-23T07:32:36.250Z","lastAccessed":"2020-07-23T07:32:36.280Z"},{"key":"ds_user","value":"ay1101140857","expires":"2020-10-21T07:32:38.000Z","maxAge":7776000,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-07-23T07:32:38.521Z","lastAccessed":"2020-07-23T07:32:38.521Z"},{"key":"ds_user_id","value":"9390552498","expires":"2020-10-21T07:32:38.000Z","maxAge":7776000,"domain":"instagram.com","path":"/","secure":true,"hostOnly":false,"creation":"2020-07-23T07:32:38.526Z","lastAccessed":"2020-07-23T07:32:38.526Z"},{"key":"sessionid","value":"9390552498%3AXPjXbNT0qWweuH%3A23","expires":"2021-07-23T07:32:38.000Z","maxAge":31536000,"domain":"instagram.com","path":"/","secure":true,"httpOnly":true,"hostOnly":false,"creation":"2020-07-23T07:32:38.526Z","lastAccessed":"2020-07-23T07:32:38.526Z"}]}',
        supportedCapabilities: [
          {
            name: 'SUPPORTED_SDK_VERSIONS',
            value: '13.0,14.0,15.0,16.0,17.0,18.0,19.0,20.0,21.0,22.0,23.0,24.0,25.0,26.0,27.0,28.0,29.0,30.0,31.0,32.0,33.0,34.0,35.0,36.0,37.0,38.0,39.0,40.0,41.0,42.0,43.0,44.0,45.0,46.0,47.0,48.0,49.0,50.0,51.0,52.0,53.0,54.0,55.0,56.0,57.0,58.0,59.0,60.0,61.0,62.0,63.0,64.0,65.0,66.0',
          },
          { name: 'FACE_TRACKER_VERSION', value: 12 },
          { name: 'segmentation', value: 'segmentation_enabled' },
          { name: 'COMPRESSION', value: 'ETC2_COMPRESSION' },
          { name: 'world_tracker', value: 'world_tracker_enabled' },
          { name: 'gyroscope', value: 'gyroscope_enabled' },
        ],
        language: 'en_US',
        timezoneOffset: '28800',
        radioType: 'wifi-none',
        capabilitiesHeader: '3brTvwE=',
        connectionTypeHeader: 'WIFI',
        isLayoutRTL: false,
        euDCEnabled: undefined,
        adsOptOut: false,
        thumbnailCacheBustingValue: 1000,
        clientSessionIdLifetime: 1200000,
        pigeonSessionIdLifetime: 1200000,
        deviceString: '26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885',
        deviceId: 'android-6ae097449298b1a4',
        uuid: 'f683fc0c-48eb-5c72-a872-84e672fdaf92',
        phoneId: '0e384200-32ca-5d64-a54e-df1e31eb5105',
        adid: '5272bc98-0c2e-58b1-9b89-f0c91b97365e',
        build: 'LRX22C',
        igWWWClaim: 'hmac.AR2GtDXlnUV7Vdy7Ku-1OLHrXrv6Chi92tmj4PlmkRt4Dn8M',
        passwordEncryptionKeyId: '60',
        passwordEncryptionPubKey: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUFvSmdPODJaKzRYSk9Za1lKc0hNZApRa29tcWZYbCs2dWdVZlRBaG9iNThMZEFVRXRvcG9KNzlDd08zMnAwWHEvY3FVckZJMGNyQTdQTnEwM3JabDB2CnNIOTkzQlp0UElCNXVnYjdTdTUrMEV1Nnh4cFljdTJXQXpudjVQRTU2ekF1cWtma0cydTcvLzNCSlpIWVdkQXEKWHY4c0kxZDV5RkdRaU1LMUVWMTNYekdGSTVpSFJ3N1MwRVlOTXRsQ2x5MCsvZkVvYWczdThYc0xTZm5mcU1UZAplWlZoMUdBc2c1OC9WUHZDR0tTckRaS0cwbzY2R1kxcDVRVk41NkY5UzV3YW1FbFBQZFhyVjR1YXlqNUd0Ym0rCmM3L2RNYkJ2Z0F2NEt3ZUl1Q2JDbkpaYzVyTk1aQ2hhdWpjZ01VT1c2ejZwTFJ6bGZNRW5XM1ZYQVdrSVE2UEQKdHdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==',
      };
    }

    // 登录成功后可以获取 ig.state.serialize
    // This function executes after every request
    // ig.request.end$.subscribe(async () => {
    //   const serialized = await ig.state.serialize();
    //   delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
    //   fakeSave(serialized);
    // });
    if (fakeExists()) {
      // import state accepts both a string as well as an object
      // the string should be a JSON object
      await ig.state.deserialize(fakeLoad());
    }

    const userId = await ig.user.getIdByUsername('andiachaermawan');
    const followersFeed = ig.feed.accountFollowers(userId);
    const wholeResponse = await followersFeed.request();
    console.log(wholeResponse); // You can reach any properties in instagram response
    // const items = await followersFeed.items();
    // console.log(items); // Here you can reach items. It's array.
    // const thirdPageItems = await followersFeed.items();
    // Feed is stateful and auto-paginated. Every subsequent request returns results from next page
    // console.log(thirdPageItems); // Here you can reach items. It's array.
    // const feedState = followersFeed.serialize(); // You can serialize feed state to have an ability to continue get next pages.
    // console.log(feedState);
    // followersFeed.deserialize(feedState);
    // const fourthPageItems = await followersFeed.items();
    // console.log(fourthPageItems);

    // 获取该用户的关注列表
    // This call will provoke request.end$ stream
    // await ig.account.login('ay1101140857@gmail.com', 'wwh520yys');
    // Most of the time you don't have to login after loading the state
    this.ctx.body = 'php是最好的语言';
  }
}

module.exports = HomeController;
