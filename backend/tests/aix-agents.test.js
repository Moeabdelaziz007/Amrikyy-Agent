/**
 * AIX Agents Test Suite
 * 
 * Tests for all AIX agent files
 * Created by Cursor - Team Lead
 */

const fs = require('fs');
const path = require('path');

describe('AIX Agents', () => {
  const agentsDir = path.join(__dirname, '../agents');
  const aixFiles = [
    'cursor.aix',
    'ona.aix',
    'gemini.aix',
    'aladdin.aix'
  ];

  describe('AIX File Structure Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have valid structure for ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        expect(fs.existsSync(filePath)).toBe(true);
        
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toBeTruthy();
        expect(content.length).toBeGreaterThan(100);
      });
    });
  });

  describe('Required Fields Validation', () => {
    aixFiles.forEach(filename => {
      test(`should contain all required fields in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for required top-level fields
        expect(content).toContain('$schema:');
        expect(content).toContain('version:');
        expect(content).toContain('genome:');
        expect(content).toContain('meta:');
        expect(content).toContain('identity:');
        expect(content).toContain('intelligence:');
      });
    });
  });

  describe('Schema Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have correct schema reference in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('$schema: https://aix-spec.org/v0.1/schema.json');
        expect(content).toContain('version: "0.1"');
        expect(content).toContain('genome: aixv1');
      });
    });
  });

  describe('Identity Section Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have valid identity section in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check identity section
        expect(content).toContain('identity:');
        expect(content).toContain('uuid:');
        expect(content).toContain('species:');
        expect(content).toContain('phenotype:');
        expect(content).toContain('name:');
        expect(content).toContain('role:');
      });
    });
  });

  describe('Intelligence Section Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have valid intelligence section in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check intelligence section
        expect(content).toContain('intelligence:');
        expect(content).toContain('cognition:');
        expect(content).toContain('model:');
        expect(content).toContain('provider:');
        expect(content).toContain('memory:');
        expect(content).toContain('plasticity:');
      });
    });
  });

  describe('DNA Scoring Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have DNA scoring section in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check DNA scoring section
        expect(content).toContain('dna_scoring:');
        expect(content).toContain('current_score:');
        expect(content).toContain('dna_potential:');
        expect(content).toContain('performance:');
        expect(content).toContain('total:');
        expect(content).toContain('level:');
      });
    });
  });

  describe('Agent-Specific Validation', () => {
    test('Cursor agent should have team lead characteristics', () => {
      const filePath = path.join(agentsDir, 'cursor.aix');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('team-lead-agent');
      expect(content).toContain('Team Lead & Coordinator');
      expect(content).toContain('leadership');
      expect(content).toContain('coordination');
    });

    test('ONA agent should have documentation characteristics', () => {
      const filePath = path.join(agentsDir, 'ona.aix');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('documentation-agent');
      expect(content).toContain('Documentation & Testing Specialist');
      expect(content).toContain('meticulous');
      expect(content).toContain('documentation');
    });

    test('Gemini agent should have performance/security characteristics', () => {
      const filePath = path.join(agentsDir, 'gemini.aix');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('performance-security-agent');
      expect(content).toContain('Performance & Security Architect');
      expect(content).toContain('security');
      expect(content).toContain('performance');
    });

    test('Aladdin agent should have travel opportunity characteristics', () => {
      const filePath = path.join(agentsDir, 'aladdin.aix');
      const content = fs.readFileSync(filePath, 'utf8');
      
      expect(content).toContain('travel-opportunity-agent');
      expect(content).toContain('Travel Opportunity Hunter');
      expect(content).toContain('opportunistic');
      expect(content).toContain('travel');
    });
  });

  describe('YAML Syntax Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have valid YAML syntax in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic YAML structure checks
        expect(content).toMatch(/^[^#]*$/m); // No comments at start
        
        // Check for proper indentation (2 spaces)
        const lines = content.split('\n');
        let hasIndentation = false;
        lines.forEach(line => {
          if (line.startsWith('  ') && !line.startsWith('    ')) {
            hasIndentation = true;
          }
        });
        expect(hasIndentation).toBe(true);
        
        // Check for valid YAML structure (key-value pairs)
        expect(content).toContain(':');
        expect(content).toContain('-');
      });
    });
  });

  describe('File Size and Content Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have reasonable file size for ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const stats = fs.statSync(filePath);
        
        expect(stats.size).toBeGreaterThan(2000); // At least 2KB
        expect(stats.size).toBeLessThan(50000); // Less than 50KB
      });
    });
  });

  describe('Unique Identifiers Validation', () => {
    test('should have unique UUIDs for all agents', () => {
      const uuids = [];
      
      aixFiles.forEach(filename => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const uuidMatch = content.match(/uuid: "([^"]+)"/);
        expect(uuidMatch).toBeTruthy();
        
        const uuid = uuidMatch[1];
        expect(uuids).not.toContain(uuid);
        uuids.push(uuid);
      });
      
      expect(uuids).toHaveLength(4);
    });

    test('should have unique species for all agents', () => {
      const species = [];
      
      aixFiles.forEach(filename => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const speciesMatch = content.match(/species: ([^\s]+)/);
        expect(speciesMatch).toBeTruthy();
        
        const agentSpecies = speciesMatch[1];
        expect(species).not.toContain(agentSpecies);
        species.push(agentSpecies);
      });
      
      expect(species).toHaveLength(4);
    });
  });

  describe('DNA Score Level Validation', () => {
    test('should have valid DNA score levels', () => {
      const validLevels = ['NOVICE', 'APPRENTICE', 'COMPETENT', 'EXPERT', 'MASTER'];
      
      aixFiles.forEach(filename => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const levelMatches = content.match(/level: ([A-Z]+)/g);
        expect(levelMatches).toBeTruthy();
        
        // Check all levels found in the file
        levelMatches.forEach(match => {
          const level = match.replace('level: ', '');
          expect(validLevels).toContain(level);
        });
      });
    });
  });

  describe('API Integration Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have valid API sections in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('apis:')) {
          expect(content).toContain('id:');
          expect(content).toContain('name:');
          expect(content).toContain('base_url:');
        }
      });
    });
  });

  describe('Security Configuration Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have security section in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('security:');
        expect(content).toContain('permissions:');
        expect(content).toContain('autonomy_level:');
      });
    });
  });

  describe('Monitoring Configuration Validation', () => {
    aixFiles.forEach(filename => {
      test(`should have monitoring section in ${filename}`, () => {
        const filePath = path.join(agentsDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        expect(content).toContain('monitoring:');
        expect(content).toContain('metrics:');
        expect(content).toContain('alerts:');
      });
    });
  });
});