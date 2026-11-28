# OpenWiki

The scheduled `openwiki code --update` writes through the `openwiki` link and
needs nothing from you. `openwiki code --init` is the exception: it refuses a
symlinked wiki directory ("expected a real directory"). To re-initialize, replace
the link with an empty `openwiki/` directory, run it, move the result into
`documentation/openwiki/`, and restore the link. `.openwikiignore` keeps
`documentation/openwiki/` out of OpenWiki's own source fingerprint, so its output
never counts as a change to the repository.

The scheduled run copes with OpenRouter's rate limits. After a failed attempt it
waits the longer of its growing delay and the reset time OpenRouter reported,
and it stops retrying at once when that reset is more than 15 minutes away, as a
daily limit is. OpenWiki exits cleanly when a page's worker ends without
submitting, so a clean run that skipped pages is run again as well: each retry
resumes the skipped pages, and the job fails only when none was refreshed. Every
attempt, with its page count, skipped pages, and reset time, is listed in the
run's job summary, with the refreshed and total pages, which the pull request
repeats. `OPENWIKI_DEBUG` is set so a skipped page's cause is in the log. The
pull request step is skipped when only `.last-update.json` and
`.page-manifest.json` changed.
