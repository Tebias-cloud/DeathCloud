const svc = require('./services/analyticsService');
svc.getDashboardStats()
  .then(d => { 
    console.log('SUCCESS - keys:', Object.keys(d)); 
    console.log('generalStats:', JSON.stringify(d.generalStats));
    console.log('topItems count:', d.topSoldItems ? d.topSoldItems.length : 'N/A');
    console.log('traffic count:', d.connectionsTraffic ? d.connectionsTraffic.length : 'N/A');
    process.exit(0);
  })
  .catch(e => { 
    console.error('ERROR:', e.message); 
    process.exit(1);
  });
