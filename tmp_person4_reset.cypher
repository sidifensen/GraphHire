MATCH (p:Person {id: 4})-[r:HAS_SKILL]->(:Skill) DELETE r;
MATCH (p:Person {id: 4})-[r:HAS_SKILL_CATEGORY]->(:SkillCategory) DELETE r;
MATCH (:SkillCategory {personId: 4})-[r:CONTAINS_SKILL]->(:Skill) DELETE r;
MATCH (:Person {id: 4})-[r:BELONGS_TO_INDUSTRY]->(:Industry) DELETE r;
MATCH (c:SkillCategory {personId: 4}) DELETE c;
