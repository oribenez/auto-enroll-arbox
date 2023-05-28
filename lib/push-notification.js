import fetch from 'node-fetch';

export async function sendPushNotification(key, title, message) {
  try {
    //send alert push notification to Ori's Iphone
    await fetch(
      `https://alertzy.app/send?accountKey=${encodeURI(key)}&title=${encodeURI(title)}&message=${encodeURI(message)}`,
      {
        method: 'POST',
        body: '',
        credentials: 'include',
      },
    );
  } catch (error) {
    console.log("Push notification didn't sent | ", error);
  }
}