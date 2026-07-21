# Count and merge BPE pairs

Count every adjacent occurrence across the corpus, then replace non-overlapping
occurrences of one pair. The starter incorrectly deduplicates within each word.
Use lexical order to make ties deterministic.
