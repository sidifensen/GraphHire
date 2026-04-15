package com.graphhire.skill.infrastructure.graph;

import io.dgraph.DgraphClient;
import io.dgraph.DgraphProto;
import io.dgraph.api.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SkillGraphClient {

    private final DgraphClient dgraphClient;

    @Autowired
    public SkillGraphClient(DgraphClient dgraphClient) {
        this.dgraphClient = dgraphClient;
    }

    /**
     * Create a skill node in Dgraph graph database.
     *
     * @param skillName the name of the skill
     * @param category the category of the skill
     * @param synonyms list of synonyms for the skill
     */
    public void createSkillNode(String skillName, String category, List<String> synonyms) {
        String query = """
            mutation {
                set {
                    <skill:%s> <type> "skill" .
                    <skill:%s> <name> "%s" .
                    <skill:%s> <category> "%s" .
                    %s
                }
            }
            """.formatted(
                skillName, skillName, skillName, skillName, category,
                buildSynonymEdges(skillName, synonyms)
        );

        dgraphClient.newTransaction().mutate(dgraphClient.newMutate().setMutation(query));
    }

    /**
     * Link two skills as related in the graph.
     *
     * @param skill1Name first skill name
     * @param skill2Name second skill name
     */
    public void linkRelatedSkills(String skill1Name, String skill2Name) {
        String query = """
            mutation {
                set {
                    <skill:%s> <related_to> <skill:%s> .
                    <skill:%s> <related_to> <skill:%s> .
                }
            }
            """.formatted(skill1Name, skill2Name, skill2Name, skill1Name);

        dgraphClient.newTransaction().mutate(dgraphClient.newMutate().setMutation(query));
    }

    /**
     * Find similar skills in the graph.
     *
     * @param skillName the skill name to search
     * @return list of similar skill names
     */
    public List<String> findSimilarSkills(String skillName) {
        String query = """
            {
                similar(func: eq(name, "%s")) {
                    expand(_all_) {
                        expand(_all_)
                    }
                }
            }
            """.formatted(skillName);

        Response response = dgraphClient.newTransaction().query(query);
        // Parse response and extract similar skills
        // In real implementation, parse the JSON response
        return List.of();
    }

    /**
     * Delete a skill node from the graph.
     *
     * @param skillName the skill name to delete
     */
    public void deleteSkillNode(String skillName) {
        String query = """
            mutation {
                delete {
                    <skill:%s> * * .
                }
            }
            """.formatted(skillName);

        dgraphClient.newTransaction().mutate(dgraphClient.newMutate().setMutation(query));
    }

    private String buildSynonymEdges(String skillName, List<String> synonyms) {
        if (synonyms == null || synonyms.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (String synonym : synonyms) {
            sb.append(String.format("<skill:%s> <synonym> \"%s\" .\n", skillName, synonym));
            sb.append(String.format("<skill:%s> <synonym_of> <skill:%s> .\n", synonym, skillName));
        }
        return sb.toString();
    }
}
