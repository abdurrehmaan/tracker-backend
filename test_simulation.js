// Test route processing without database - just validation logic
function simulateProcessRoute(origin, destination) {
  console.log('=== ROUTE PROCESSING SIMULATION ===');
  console.log('Received origin:', `"${origin}"`);
  console.log('Received destination:', `"${destination}"`);

  // Validate required fields
  if (!origin || !destination) {
    return {
      success: false,
      message: 'Origin and destination are required',
      debug: {
        receivedOrigin: origin,
        receivedDestination: destination
      }
    };
  }

  // Simulate database check - with exact match
  const existingRoutes = [
    { id: 1, origin: "QICT", destination: "DTP", name: "QICT ➔ DTP" },
    { id: 2, origin: "Qasim International Container Terminal", destination: "Torkham Dry Port", name: "Qasim International Container Terminal ➔ Torkham Dry Port" }
  ];

  console.log('Searching for similar routes...');
  const similarRoutes = existingRoutes.filter(route => {
    return route.origin.toLowerCase().includes(origin.toLowerCase()) ||
           route.destination.toLowerCase().includes(destination.toLowerCase()) ||
           origin.toLowerCase().includes(route.origin.toLowerCase()) ||
           destination.toLowerCase().includes(route.destination.toLowerCase());
  });
  
  console.log(`Found ${similarRoutes.length} similar routes:`);
  similarRoutes.forEach(route => {
    console.log(`  - ID: ${route.id}, Origin: "${route.origin}", Destination: "${route.destination}"`);
  });

  // Check for exact match
  console.log('Checking for exact match...');
  const exactMatch = existingRoutes.find(route => 
    route.origin.toLowerCase() === origin.toLowerCase() && 
    route.destination.toLowerCase() === destination.toLowerCase()
  );

  console.log(`Exact match query result: ${exactMatch ? '1 row' : '0 rows'}`);

  if (exactMatch) {
    console.log(`Route Found - ID: ${exactMatch.id}, Origin: "${exactMatch.origin}", Destination: "${exactMatch.destination}"`);
    
    return {
      success: true,
      message: 'Route exists in database',
      data: {
        routeExists: true,
        routeId: exactMatch.id,
        origin: exactMatch.origin,
        destination: exactMatch.destination,
        routeName: `${exactMatch.origin} ➔ ${exactMatch.destination}`,
        routeType: 'original'
      },
      debug: {
        searchedOrigin: origin,
        searchedDestination: destination,
        matchedOrigin: exactMatch.origin,
        matchedDestination: exactMatch.destination,
        similarRoutesFound: similarRoutes.length
      }
    };
  } else {
    // Create new route
    console.log(`No exact match found. Creating new route: "${origin}" ➔ "${destination}"`);
    const routeName = `${origin} ➔ ${destination}`;
    const newRouteId = Math.floor(Math.random() * 1000) + 1; // Simulate database ID
    
    console.log(`Route Created - ID: ${newRouteId}, Name: "${routeName}"`);
    
    return {
      success: true,
      message: 'Route created successfully',
      data: {
        routeExists: false,
        routeCreated: true,
        routeId: newRouteId,
        routeName: routeName,
        origin: origin,
        destination: destination,
        routeType: 'original'
      },
      debug: {
        searchedOrigin: origin,
        searchedDestination: destination,
        similarRoutesFound: similarRoutes.length
      }
    };
  }
}

// Test the function
const testResult = simulateProcessRoute('Qasim International Container Terminal', 'Torkham Dry Port');
console.log('\n=== FINAL RESULT ===');
console.log(JSON.stringify(testResult, null, 2));