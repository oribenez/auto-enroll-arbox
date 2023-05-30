import fetch from 'node-fetch';

export async function sendPushNotification(key, title, message, body) {
  try {
    //send alert push notification to Ori's Iphone
    let fetchStr = `https://alertzy.app/send?accountKey=${encodeURI(key)}&title=${encodeURI(title)}&message=${encodeURI(message)}`;
    await fetch(
      fetchStr,
      {
        method: 'POST',
        body,
        credentials: 'include',
      },
    );
  } catch (error) {
    console.log("Push notification didn't sent | ", error);
  }
}