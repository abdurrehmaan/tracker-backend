// Simple route matching simulation without database
function testRouteMatching() {
  // Simulate existing routes in database
  const existingRoutes = [
    { id: 1, origin: "QICT", destination: "DTP", name: "QICT ➔ DTP" },
    { id: 2, origin: "Karachi Port", destination: "Islamabad", name: "Karachi Port ➔ Islamabad" },
    { id: 3, origin: "Lahore", destination: "Peshawar", name: "Lahore ➔ Peshawar" }
  ];

  // Test inputs
  const testOrigin = "Qasim International Container Terminal";
  const testDestination = "Torkham Dry Port";

  console.log("=== ROUTE MATCHING TEST ===");
  console.log(`Testing: "${testOrigin}" ➔ "${testDestination}"`);
  console.log("\nExisting routes in database:");
  existingRoutes.forEach(route => {
    console.log(`  ${route.id}: "${route.origin}" ➔ "${route.destination}"`);
  });

  // Test exact matching logic
  console.log("\n=== EXACT MATCH TEST ===");
  const exactMatch = existingRoutes.find(route => 
    route.origin.toLowerCase() === testOrigin.toLowerCase() && 
    route.destination.toLowerCase() === testDestination.toLowerCase()
  );

  if (exactMatch) {
    console.log(`✅ EXACT MATCH FOUND: Route ID ${exactMatch.id}`);
    console.log(`   Database: "${exactMatch.origin}" ➔ "${exactMatch.destination}"`);
    console.log(`   Input:    "${testOrigin}" ➔ "${testDestination}"`);
  } else {
    console.log(`❌ NO EXACT MATCH FOUND`);
    console.log(`   Should create new route: "${testOrigin}" ➔ "${testDestination}"`);
  }

  // Test partial matching (what might be happening incorrectly)
  console.log("\n=== PARTIAL MATCH TEST (SHOULD NOT HAPPEN) ===");
  const partialMatches = existingRoutes.filter(route => {
    const originMatch = route.origin.toLowerCase().includes(testOrigin.toLowerCase().split(' ')[0]) ||
                       testOrigin.toLowerCase().includes(route.origin.toLowerCase().split(' ')[0]);
    const destMatch = route.destination.toLowerCase().includes(testDestination.toLowerCase().split(' ')[0]) ||
                     testDestination.toLowerCase().includes(route.destination.toLowerCase().split(' ')[0]);
    return originMatch && destMatch;
  });

  if (partialMatches.length > 0) {
    console.log(`🚨 PARTIAL MATCHES FOUND (INCORRECT BEHAVIOR):`);
    partialMatches.forEach(route => {
      console.log(`   ${route.id}: "${route.origin}" ➔ "${route.destination}"`);
    });
  } else {
    console.log(`✅ No partial matches found (correct behavior)`);
  }

  // Test the actual SQL-like logic
  console.log("\n=== SQL LOGIC SIMULATION ===");
  console.log("SQL Query: WHERE LOWER(origin) = LOWER($1) AND LOWER(destination) = LOWER($2)");
  console.log(`Parameters: $1="${testOrigin}", $2="${testDestination}"`);
  
  existingRoutes.forEach(route => {
    const originEquals = route.origin.toLowerCase() === testOrigin.toLowerCase();
    const destEquals = route.destination.toLowerCase() === testDestination.toLowerCase();
    const bothMatch = originEquals && destEquals;
    
    console.log(`  Route ${route.id}: origin="${route.origin.toLowerCase()}" === "${testOrigin.toLowerCase()}" = ${originEquals}`);
    console.log(`  Route ${route.id}: dest="${route.destination.toLowerCase()}" === "${testDestination.toLowerCase()}" = ${destEquals}`);
    console.log(`  Route ${route.id}: BOTH MATCH = ${bothMatch}`);
    console.log(`  ---`);
  });

  console.log("\n=== CONCLUSION ===");
  console.log("Based on this test, the exact matching logic should work correctly.");
  console.log("The issue might be:");
  console.log("1. Different data in the actual database");
  console.log("2. API receiving different input than expected");
  console.log("3. Database connection/query issues");
  console.log("4. Caching or transaction issues");
}

testRouteMatching();