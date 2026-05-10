async function test() {
    console.log("Testing specific route API...");
    const resp = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/route/290A');
    const json = await resp.json();
    console.log("Status:", resp.status);
    console.log("Data length:", json.data ? json.data.length : 'no data');
    if (json.data && json.data.length > 0) {
        console.log("First entry:", json.data[0]);
    }
}
test();
