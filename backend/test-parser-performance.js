const fs = require('fs');
const path = require('path');
const AIXParser = require('./src/aix/AIXParser');

async function runBenchmark() {
  console.log('--- AIX Parser Performance Benchmark ---');

  // 1. Read the sample AIX file
  const aixFilePath = path.join(__dirname, '../amrikyy-agent.aix.json');
  const aixContent = fs.readFileSync(aixFilePath, 'utf-8');
  console.log(`Loaded sample file: ${path.basename(aixFilePath)}`);

  // 2. Instantiate the parser
  const parser = new AIXParser();

  // 3. Run the benchmark
  const iterations = 100;
  console.log(`Running ${iterations} parsing iterations...`);

  const startTime = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    await parser.parse(aixContent);
  }

  const endTime = process.hrtime.bigint();
  const totalTimeMs = Number(endTime - startTime) / 1e6;
  const avgTimeMs = totalTimeMs / iterations;

  console.log('\n--- Benchmark Results ---');
  console.log(`Total iterations: ${iterations}`);
  console.log(`Total time: ${totalTimeMs.toFixed(2)} ms`);
  console.log(`Average parsing time: ${avgTimeMs.toFixed(2)} ms per file`);
  console.log('------------------------');
}

runBenchmark().catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
