import mqtt from 'mqtt';
import 'dotenv/config';

const apiUrl = (process.env.TELEMETRY_API_URL || 'http://backend:3000/api').replace(
  /\/$/,
  '',
);
const jwtToken = process.env.TELEMETRY_JWT_TOKEN;
const appDeviceId = process.env.TELEMETRY_DEVICE_ID;
const simulatorMode = process.env.SIMULATOR_MODE || 'backend';
const thingsboardHost = process.env.THINGSBOARD_HOST;
const thingsboardPort = Number(process.env.THINGSBOARD_PORT || 1883);
const thingsboardToken = process.env.THINGSBOARD_TOKEN;
const hasUsableThingsBoardToken =
  thingsboardToken &&
  !['your_actual_device_token', 'your_actual_device_access_token'].includes(
    thingsboardToken,
  );

function generateSensorData() {
  return {
    temperature: Number((20 + Math.random() * 15).toFixed(1)),
    humidity: Math.floor(40 + Math.random() * 41),
    battery: Math.floor(20 + Math.random() * 81),
  };
}

async function sendThroughBackend(data) {
  const response = await fetch(`${apiUrl}/devices/${appDeviceId}/telemetry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Backend telemetry rejected (${response.status})`);
  }
}

function startThingsBoardPublisher() {
  if (!thingsboardHost || !hasUsableThingsBoardToken) {
    console.log(
      'Telemetry simulator is idle. Configure TELEMETRY_JWT_TOKEN and TELEMETRY_DEVICE_ID for backend mode, or THINGSBOARD_TOKEN for MQTT mode.',
    );
    setInterval(() => {}, 60 * 60 * 1000);
    return;
  }

  const client = mqtt.connect(`mqtt://${thingsboardHost}:${thingsboardPort}`, {
    username: thingsboardToken,
    clientId: `sensor_${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: 0,
  });
  const topic = 'v1/devices/me/telemetry';

  client.on('connect', () => {
    console.log('Connected to ThingsBoard MQTT.');
    const publishTelemetry = () => {
      const data = generateSensorData();
      client.publish(topic, JSON.stringify(data), { qos: 0 }, (error) => {
        if (error) console.error('Publish failed:', error.message);
        else console.log('Telemetry sent:', data);
      });
    };
    publishTelemetry();
    setInterval(publishTelemetry, 5000);
  });

  client.on('error', (error) => {
    console.error(
      'MQTT error:',
      error.message,
      'Check that THINGSBOARD_TOKEN belongs to a device in this ThingsBoard instance.',
    );
    client.end(true);
    setInterval(() => {}, 60 * 60 * 1000);
  });
}

if (jwtToken && appDeviceId) {
  console.log(`Sending telemetry through backend for device ${appDeviceId}.`);
  const sendTelemetry = async () => {
    try {
      const data = generateSensorData();
      await sendThroughBackend(data);
      console.log('Telemetry accepted by backend:', data);
    } catch (error) {
      console.error(
        'Backend telemetry failed:',
        error instanceof Error ? error.message : String(error),
      );
    }
  };
  await sendTelemetry();
  setInterval(sendTelemetry, 5000);
} else if (simulatorMode === 'mqtt') {
  startThingsBoardPublisher();
} else {
  console.log(
    'Telemetry simulator is idle. Configure TELEMETRY_JWT_TOKEN and TELEMETRY_DEVICE_ID for backend mode, or set SIMULATOR_MODE=mqtt for direct ThingsBoard mode.',
  );
  setInterval(() => {}, 60 * 60 * 1000);
}
