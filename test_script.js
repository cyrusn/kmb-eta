async function run() {
    const stopsResp = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/290A/outbound/1`);
    const stopsJson = await stopsResp.json();
    console.log("290A Outbound Stops:", stopsJson.data.slice(0, 3));
}
run();
