// Environment Variables
import { config } from "dotenv-safe";
config();

// Externals
import axios from "axios";

class GitHubService {
  auth = process.env.GITHUB_TOKEN;

  async graphqlRequest(query: string) {
    const { data } = await axios.post(
      "https://api.github.com/graphql",
      {
        query,
      },
      {
        headers: { Authorization: `bearer ${this.auth}` },
      }
    );

    return data.data;
  }
}

const githubService = new GitHubService();

export default githubService;
