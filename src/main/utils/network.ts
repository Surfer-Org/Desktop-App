import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { session } from 'electron';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

export async function getTwitterCredentials(company: string, name: string) {
  const userData = app.getPath('userData');
  const twitterCredentialsPath = path.join(
    userData,
    'surfer_data',
    company,
    name,
    'twitterCredentials.json',
  );
  return new Promise((resolve) => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['*://*.twitter.com/*', '*://*.x.com/*'] },
      (details: any, callback) => {
        if (details.url.includes('/Bookmarks?variables')) {
          const bookmarksUrlPattern =
            /https:\/\/x\.com\/i\/api\/graphql\/([^/]+)\/Bookmarks\?/;
          const match = details.url.match(bookmarksUrlPattern);

          let result = {
            bookmarksApiId: null as string | null,
            auth: null as string | null,
            cookie: null as string | null,
            csrf: null as string | null,
          };

          if (match) {
            result.bookmarksApiId = match[1];
          }

          result.auth = details.requestHeaders['authorization'] || null;
          result.cookie = details.requestHeaders['Cookie'] || null;
          result.csrf = details.requestHeaders['x-csrf-token'] || null;

          if (
            result.bookmarksApiId &&
            result.auth &&
            result.cookie &&
            result.csrf
          ) {
            console.log('got twitter credentials!');

            // Create the directory if it doesn't exist
            fs.mkdirSync(path.dirname(twitterCredentialsPath), {
              recursive: true,
            });

            // Write the bigData to the file
            fs.writeFileSync(
              twitterCredentialsPath,
              JSON.stringify(result, null, 2),
            );
            resolve(result);
          }
        }

        callback({ requestHeaders: details.requestHeaders });
      },
    );
  });
}

export async function getNotionCredentials(company: string, name: string) {
  const userData = app.getPath('userData');
  const notionCredentialsPath = path.join(
    userData,
    'surfer_data',
    company,
    name,
    'notionCredentials.json',
  );

  return new Promise((resolve) => {
    let result = {
      cookie: null as string | null,
      spaceId: null as string | null,
      timezone: dayjs.tz.guess()
    };

    // Intercept requests to get cookie
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['*://*.notion.so/api/v3*'] },
      (details: any, callback) => {
        if (details.requestHeaders['Cookie'] && details.requestHeaders['x-notion-space-id']) {
          result.cookie = details.requestHeaders['Cookie'];
          result.spaceId = details.requestHeaders['x-notion-space-id'];
          // Create the directory if it doesn't exist
          fs.mkdirSync(path.dirname(notionCredentialsPath), {
            recursive: true,
          });

          // Write the bigData to the file
          fs.writeFileSync(
            notionCredentialsPath,
            JSON.stringify(result, null, 2),
          );
          resolve(result);
        }
        callback({ requestHeaders: details.requestHeaders });
      },
    );
  });
}