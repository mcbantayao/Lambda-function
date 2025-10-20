import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "ap-southeast-1" });

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event));

  // 🔧 Fix: detect and decode base64 automatically
  let decodedBody = event.body;

  if (event.isBase64Encoded) {
    decodedBody = Buffer.from(event.body, "base64").toString("utf8");
    console.log("Decoded base64 body:", decodedBody);
  }

  // 🔧 Fix: parse URL-encoded data correctly
  const params = new URLSearchParams(decodedBody);
  const name = params.get("name");
  const email = params.get("email");
  const message = params.get("message");

  console.log("Parsed form data:", { name, email, message });

  const emailParams = {
    Destination: { ToAddresses: ["mcbantayao@gmail.com"] },
    Message: {
      Body: {
        Text: { Data: `From: ${name} (${email})\n\n${message}` },
      },
      Subject: { Data: `New message from ${name}` },
    },
    Source: "mcbantayao@gmail.com", // must be verified in SES
  };

  try {
    await ses.send(new SendEmailCommand(emailParams));
  
    return {
      statusCode: 302,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Location": "http://itportfoliosite.s3-website-ap-southeast-1.amazonaws.com/contact-success.html", // 👈 your S3 page
      },
      body: "",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 302,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Location": "http://itportfoliosite.s3-website-ap-southeast-1.amazonaws.com/contact-error.html", // 👈 redirect on failure
      },
      body: "",
    };
  }
};
