import mqtt from "mqtt";
import "dotenv/config";

const host = process.env.THINGSBOARD_HOST;
const port = Number(process.env.THINGSBOARD_PORT || 1883);
const token = process.env.THINGSBOARD_TOKEN;

if (
    !host ||
    !token ||
    token === "your_actual_device_token" ||
    token === "your_actual_device_access_token"
) {
    throw new Error(
        "Configure THINGSBOARD_HOST and a real ThingsBoard THINGSBOARD_TOKEN before starting the simulator"
    );
}

const brokerUrl = `mqtt://${host}:${port}`;
const topic = "v1/devices/me/telemetry";

const client = mqtt.connect(brokerUrl, {
    username: token,
    clientId: `sensor_${Math.random().toString(16).slice(2, 10)}`,
});

function generateSensorData() {
    return {
        temperature: Number(
            (20 + Math.random() * 15).toFixed(1)
        ),
        humidity: Math.floor(40 + Math.random() * 41),
        battery: Math.floor(20 + Math.random() * 81),
        timestamp: new Date().toISOString(),
    };
}

client.on("connect", () => {
    console.log("Connected to ThingsBoard MQTT!");
    console.log("Sending telemetry every 5 seconds.\n");

    function publishTelemetry() {
        const data = generateSensorData();

        client.publish(
            topic,
            JSON.stringify(data),
            { qos: 0 },
            (error) => {
                if (error) {
                    console.error("Publish failed:", error.message);
                    return;
                }

                console.log("Telemetry sent:", data);
            }
        );
    }

    publishTelemetry();

    setInterval(publishTelemetry, 5000);
});

client.on("error", (error) => {
    console.error("MQTT error:", error.message);
    client.end(true);
    process.exitCode = 1;
});