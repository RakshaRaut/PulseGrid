function generateSensorData() {
    const temperature = Number(
        (20 + Math.random() * 15).toFixed(1)
    );

    const humidity = Math.floor(
        40 + Math.random() * 41
    );

    const battery = Math.floor(
        20 + Math.random() * 81
    );

    return {
        temperature,
        humidity,
        battery,
    };
}

function displaySensorData() {
    const data = generateSensorData();

    console.log("================================");
    console.log("         IoT Simulator");
    console.log("================================");

    console.log(`Temperature: ${data.temperature}°C`);
    console.log(`Humidity:    ${data.humidity}%`);
    console.log(`Battery:     ${data.battery}%`);

    console.log("================================\n");
}

displaySensorData();

setInterval(displaySensorData, 5000);