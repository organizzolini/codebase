# OpenWiki

The scheduled `openwiki code --update` writes through the `openwiki` link and
needs nothing from you. `openwiki code --init` is the exception: it refuses a
symlinked wiki directory ("expected a real directory"). To re-initialize, replace
the link with an empty `openwiki/` directory, run it, move the result into
`documentation/openwiki/`, and restore the link. `.openwikiignore` keeps
`documentation/openwiki/` out of OpenWiki's own source fingerprint, so its output
never counts as a change to the repository.
