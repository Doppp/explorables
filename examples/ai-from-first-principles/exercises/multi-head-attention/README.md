# Implement causal multi-head attention

Split each projected token vector into contiguous heads, scale query-key scores, apply the causal mask before stable softmax, mix values independently, and concatenate head outputs in their original order.

The starter interleaves features between heads, omits score scaling, and masks probabilities after normalisation.
