# Implement RMSNorm and a residual sublayer

Implement RMSNorm without mean-centring, then pass the normalised vector to a
supplied transformation and add its update to the untouched input. The starter
implements LayerNorm-like centring and replaces the residual stream.

After the tests pass, explain why a zero transformation must leave the input
unchanged.
