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
- When registering, it doesn't properly report whether the email was sent successfully or not. There is only basic email format checking, which means obviously non-emails are notified that emailing wasn't possible but they can still use the app.
- The data table headers are horizontally misplaced before the data tables are filled with information.
- Sometimes when hovering the cursor over the toasts they seem to get stuck until the user clicks and moves the cursor around. Maybe this is an intended feature.
- Feed list checkboxes seem to make the row just a bit taller when checked.
- After having registered, the user can still visit /register/ and see the register page, although the system does check whether a user exists already and refuses another user, but it could also just redirect to login, after having checked whether the user is also reregistering. Basic /reregister/ without the token could also redirect.
- One Japanese feed https://assets.wor.jp/rss/rdf/reuters/top.rdf didn't work with process.py unless the newspaper4 installation was in format newspaper4k[all] as the tool instructed in its error report for the particular feed (also suggesting newspaper4k[ja]). There is seemingly nothing about this function in newspaper4k's docs.
- General query wouldn't want to work with text and url query. Fixing one issue with that algorithm made another issue pop up, and fixing that made a third pop up. Just forced one side at a time. The query_processor algorithm can probably be simplified since the final one has remnants of trying to make them work together.
- Word cloud might be more efficient if the counting happened at backend. It might need better handling of commas and such symbols attached to words not to be included, rather than making exception for all cases in the stop words.
- There is a ReDoS vulnerability concerning d3-color, which is seemingly caused by react-d3-cloud, but this seems quite difficult to solve. However it doesn't appear to be open to non-registered users, and even then would apparently just slow the app down.
- App would run better on PostgreSQL, which would need to be changed at the original collector. It would make searching easier, exports faster, concurrent functions not as likely to cause errors and also make setting resource limits easier so that the app doesn't crash.
- The data/feeds.txt might be possible to simplify with the original rss-fetcher repo if an empty feeds.txt inside a data folder is already part of it, thus making the creation of the data folder in the Dockerfile here unnecessary too.
- Very large databases and downloads are untested. Streaming was added to downloads to handle it somewhat. There's still possibility very large downloads would prove problematic. For example, due to how the format works, Parquet saves the file first locally, and while it's compressed, at around 3/4 storage space downloading all database data will make it run out of storage space. Parquet might also timeout on very very large downloads before it can start sending data, as requests timeout without data being sent back, but this might be easily solvable by status updates.
- Flask could be changed to Gunicorn for more efficiency.
- The very minor browser console listed issues "A form field element should have an id or name attribute" and "No label associated with a form field" could be looked at.
- With 40 feeds it takes a long time to go through the fetching process even if there's little to nothing to be added. With fetching every 5 minutes it seems to be always processing. The fetching interval could be greatly increased. If this proves a problem in the future, an easy fix without changing code is just to create two deployment/pod instances in Rahti, using the main yaml with half the max values and the guest yaml with half the max values. Also, if you change the minutes, update the info accordion, tooltip in Dashboard and maybe Rahti guide too.
- There's something strange with the memory garbage collection of the Flask downloads. The memory usage growth from a download seems to stick around until the next download which is when garbage collection kicks in and nulls it, according to Rahti's metrics. If memory serves right this happened before with send_from_directory as well. Yet this might only be an issue concerning CSC billing units. Restarting rollout should clear it.

## Dependency updates
The workflows, package.json, requirements.txt and requirements-dev.txt contain the dependency information, so if you want to try to fix an issue by updating the dependencies, update the version numbers in these. Note that ESLint was not able to updated to the latest 9.7.0 version at the time due to another dependency requiring it to be 8.57.0 or lower. Likewise for other dependencies, updates for them might break down other things. Also, if the original news-article-collection database is updated with a larger change, as it stands it would likely require all of the OpenShift PVCs to be shut down and started again (this was noticed when adding the title column).

## Upkeep: frequent critical bugs unrelated to own code
During production, two critical bugs appeared that were unrelated to our code. First was a bug with Node.js 22.5.0, which prevented builds from happening at all, which was fixed in 22.5.1. Second was newspaper4's nltk bug, which didn't break the build, but broke down process.py. That nltk was specifically installed as the fix version 3.9b1 in our Dockerfile to take care of it for a short while until they introduced the fix in their main release.

## Naming
It might be useful to unify some of the naming, as various names for the app have been used in different parts: news collector, news container, news collection and so on. We missed out on a good acronym nickname for the application: NACCI - News Article Collection Container Implementation. 

## General note about CI and tests
If you add or change some feature and break a test without understanding how to fix the test, rather than not doing anything about it and letting the CI workflow simply always fail with further cosmetic changes, it might be optimal to comment out the particular test that fails rather than just letting the entire CI keep failing.

Also, Codecov might be useful to add plus its badge to README.md, but this required the owner to set it up. Nevertheless the runtests.sh generated coverage-reports.html does essentially the same job.

## Possibility of not collecting/downloading HTML
For people with CSC billing unit or just storage issues, they might not want the HTML data. Here's a quick sketch of how one could add a button on Info next to Get Data Size button that opens up a Settings window, where it requests data of the settings from backend, and then having received that shows their status. For now there would just be an option to either fetch or not fetch HTML data, having fetch as standard and also informing the user that it's standard. If the user turned it off, and thus the settings.json in the PVC data folder had the HTML fetching off, then when running run_subprocess in content_fetcher.py, the logic would go:

```python
        settings_path = os.path.join(scheduler.app.config['FETCHER_FOLDER'], 'data', 'settings.json')
        with open(settings_path, 'r') as settings_file:
            settings = json.load(settings_file)
        env = os.environ.copy()

        if settings.get('skip_html', False):
            env['SKIP_HTML'] = 'true'
        elif 'SKIP_HTML' in env:
            del env['SKIP_HTML']

        result = subprocess.run(
            ['python3', script_name],
            cwd=scheduler.app.config['FETCHER_FOLDER'],
            capture_output=True,
            check=True,
            text=True,
	    env=env
        )
```

and in the news-article-collection process.py you'd have:

```python
import os
        skip_html = os.environ.get('SKIP_HTML', '').lower() == 'true'
        article_data = {
            'url': url,
            'title': article.title,
            'full_text': article.text,
            'time': article.publish_date
        }
        if not skip_html:
            article_data['html'] = article.html
        new_article = database.articles.insert().values(**article_data)
```

that checks env variable SKIP_HTML whether to skip HTMl fetching. If this null style doesn't work properly it might be best to set it as an empty string in the skip case. In addition to these you'd also have to do the button for changing settings.json on the Info page, which would require its own route for checking settings and another for setting them. The settings.json could also have an option to set the fetching interval. Varying whether to download HTML or not would require changing the download settings in many parts, but if they're not being fetched that makes it simpler.
