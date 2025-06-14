import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

interface Commit {
  commit: {
    message: string;
  };
}

const commits = (await d3.json('/api/commits')) as Commit[];

const list = d3.select('#commits');
list
  .selectAll('li')
  .data(commits)
  .enter()
  .append('li')
  .text((d: Commit) => d.commit.message.trim());
