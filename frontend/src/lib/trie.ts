/**
 * Trie (Prefix Tree) for O(m) client-side product search.
 *
 * Structure:
 *   TrieNode {
 *     children: Map<char, TrieNode>   // Map for O(1) char lookup, no prototype chain
 *     products: Set<ProductSummary>   // Set for O(1) insert + automatic deduplication
 *   }
 *
 * Why Trie over simple Array.filter:
 *   - Array.filter on every keystroke = O(n × L) per search where L = product name length.
 *   - Trie query = O(m + k) where m = query length, k = result size.
 *     The n factor is completely eliminated after the one-time build.
 *
 * Why Map for children (not plain object):
 *   - O(1) average get/set with no prototype chain overhead.
 *   - No risk of collisions with inherited keys like "constructor", "toString".
 *
 * Why Set for products at each node (not Array):
 *   - A product is indexed under every prefix of every token in its name + brand.
 *     e.g. "Apple iPhone" → nodes a, ap, app, appl, apple, i, ip, iph, ...
 *   - Set deduplicates automatically in O(1) per insert.
 *   - Array.includes is O(n); Set.has is O(1).
 */

import type { ProductSummary } from '@/schemas/product';

interface TrieNode {
  children: Map<string, TrieNode>;
  products: Set<ProductSummary>;
}

function createNode(): TrieNode {
  return { children: new Map(), products: new Set() };
}

export class ProductTrie {
  private root: TrieNode = createNode();
  private size = 0;

  /** Insert a product under every prefix of every token in name + brand. */
  insert(product: ProductSummary): void {
    // Tokenise: split on whitespace, normalise to lowercase.
    const tokens = `${product.name} ${product.brand}`
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    for (const token of tokens) {
      let node = this.root;
      for (const char of token) {
        if (!node.children.has(char)) {
          node.children.set(char, createNode());
        }
        // Non-null assertion safe: we just set it above.
        node = node.children.get(char)!;
        // Register the product at this prefix node so any prefix returns it.
        node.products.add(product);
      }
    }
    this.size++;
  }

  /**
   * Search for products whose name or brand starts with `query`.
   * Returns an Array (stable order) built from the Set at the terminal node.
   * Time: O(m) to traverse + O(k) to collect — independent of catalogue size.
   */
  search(query: string): ProductSummary[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    let node = this.root;
    for (const char of q) {
      if (!node.children.has(char)) return []; // prefix not found
      node = node.children.get(char)!;
    }

    // All products under this prefix node.
    return Array.from(node.products);
  }

  /** Build a fresh Trie from a product array — call once on initial fetch. */
  static fromProducts(products: ProductSummary[]): ProductTrie {
    const trie = new ProductTrie();
    for (const p of products) trie.insert(p);
    return trie;
  }

  get productCount(): number {
    return this.size;
  }
}
