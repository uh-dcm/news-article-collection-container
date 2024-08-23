# Future development (past summer 2024)

## Requested future functionalities
- Article titles

Current app doesn't show article titles in the data table. This request came up very late and there wasn't enough time to implement it.

- Immediately visible statistics

Not necessarily all of the statistics should be immediately visible, but at least some part of them.

- Short stats of the fetching process itself

There should be some information about when the last fetch happened or even a list of the fetches on Dashboard, and maybe some other information about them too.

- "Saving" the search

Essentially being able to either copy a bit of json or download a file, which when inputted back reinserts the search.

<br>

Additional note about requests: some generally cited examples of sites for inspiration were https://www.mediacloud.org/ and https://dl.acm.org/.

## Small issues
- The app doesn't conform properly to small screens.
- Obviously non-functioning feed addresses like "ttps://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss" and "net::ERR_INCOMPLETE_CHUNKED_ENCODING" are able to pass the current feed add validity check.
- When registering, it doesn't properly report whether the email was sent successfully or not.
- The data table headers are horizontally misplaced before the data tables are filled with information.
- Sometimes when hovering the cursor over the toasts they seem to get stuck until the user clicks and moves the cursor around. Maybe this is an intended feature.
- Feed list checkboxes seem to make the row just a bit taller when checked.
- After having registered, the user can still visit /register/ and see the register page, although the system does check whether a user exists already and refuses another user, but it could also just redirect to login, after having checked whether the user is also reregistering. Basic /reregister/ without the token could also redirect.
- One Japanese feed https://assets.wor.jp/rss/rdf/reuters/top.rdf didn't work with process.py unless the newspaper4 installation was in format newspaper4k[all] as the tool instructed in its error report for the particular feed (also suggesting newspaper4k[ja]). There is seemingly nothing about this function in newspaper4k's docs.
- General query wouldn't want to work with text and url query. Fixing one issue with that algorithm made another issue pop up, and fixing that made a third pop up. Just forced one side at a time. The query_processor algorithm can probably be simplified since the final one has remnants of trying to make them work together.
- App would probably run a bit better on PostgreSQL, which would need to be changed at the original collector.

## Dependency updates
The workflows, package.json, requirements.txt and requirements-dev.txt contain the dependency information, so if you want to try to fix an issue by updating the dependencies, update the version numbers in these. Note that ESLint was not able to updated to the latest 9.7.0 version at the time due to another dependency requiring it to be 8.57.0 or lower. Likewise for other dependencies, updates for them might break down other things.

## Upkeep: frequent critical bugs unrelated to own code
During production, two critical bugs appeared that were unrelated to our code. First was a bug with Node.js 22.5.0, which prevented builds from happening at all, which was fixed in 22.5.1. Second was newspaper4's nltk bug, which didn't break the build, but broke down process.py. That nltk was specifically installed as the fix version 3.9b1 in our Dockerfile to take care of it for a short while until they introduced the fix in their main release.

## Big problem with Unverified emails
All of the emails sent from Rahti/CSC are unverified, and get thrown into spam in Gmail. The problem is manyfold and is seemingly more about how CSC and Rahti have set up their system.

IP 86.50.27.5 isn't authorized to send emails for helsinki.fi:
`spf=fail (sender IP is 86.50.27.5) smtp.mailfrom=helsinki.fi`

This was even though they talked about using university emails to send email.

And dkim, dmarc and general authorization also failed:
`dkim=none (message not signed) header.d=none`
`dmarc=fail action=none header.from=helsinki.fi`
`compauth=fail reason=601`

We recommend being in contact with CSC if you want to solve this. We did contact them, and they instructed to copy their example, which we did, even more precisely in a fork, and it didn't work. They are working on something.

## Naming
It might be useful to unify some of the naming, as various names for the app have been used in different parts: news collector, news container, news collection and so on. We missed out on a good acronym nickname for the application: NACCI - News Article Collection Container Implementation. 

## General note about CI and tests
If you add or change some feature and break a test without understanding how to fix the test, rather than not doing anything about it and letting the CI workflow simply always fail with further cosmetic changes, it might be optimal to comment out the particular test that fails rather than just letting the entire CI keep failing.

Also, Codecov might be useful to add plus its badge to README.md, but this required the owner to set it up. Nevertheless the runtests.sh generated coverage-reports.html does essentially the same job.
