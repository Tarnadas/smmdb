use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};
use twox_hash::XxHash64;

#[derive(Debug, Deserialize, Serialize)]
pub struct MinHash {
    hash: Vec<u64>,
}

static MINHASH_PRIME: u64 = 4_294_967_291;
static MAX_HASH: u64 = 4_294_967_295;
static XXHASH_SEED: u64 = 0xDEAD_BEEF;

fn calculate_hash(t: &[u8]) -> u64 {
    let mut s = XxHash64::with_seed(XXHASH_SEED);
    t.hash(&mut s);
    s.finish()
}

static mut HASH_SEED: u32 = 1;

fn get_rand_int() -> u64 {
    unsafe {
        let max_hash = MAX_HASH as f64;
        let x = f64::from(HASH_SEED).sin() * max_hash;
        HASH_SEED += 1;

        ((x - x.floor()) * max_hash).floor() as u64
    }
}

fn get_random_perm(size: usize) -> Vec<u64> {
    let mut perm = Vec::with_capacity(size);

    let mut used: HashSet<u64> = HashSet::new();

    while perm.len() < size {
        let mut val = get_rand_int();

        while used.contains(&val) {
            val = get_rand_int();
        }

        used.insert(val);
        perm.push(val);
    }

    perm
}

#[derive(Debug)]
pub struct PermGen {
    perm_a: Vec<u64>,
    perm_b: Vec<u64>,
    num_perm: usize,
}

impl PermGen {
    pub fn new(num_perm: usize) -> PermGen {
        let perm_a = get_random_perm(num_perm);
        let perm_b = get_random_perm(num_perm);

        PermGen {
            perm_a,
            perm_b,
            num_perm,
        }
    }

    pub fn num_perm(&self) -> usize {
        self.num_perm
    }
}

impl MinHash {
    pub fn new(perm: &PermGen) -> MinHash {
        let mut buffer: Vec<u64> = Vec::with_capacity(perm.num_perm());
        buffer.resize(perm.num_perm(), MAX_HASH);

        MinHash { hash: buffer }
    }

    pub fn num_perm(&self) -> usize {
        self.hash.capacity()
    }

    pub fn update(&mut self, perm: &PermGen, input: &[u8]) {
        let mut index = 0;
        let num_perm = self.num_perm();

        while index < num_perm {
            let a = perm.perm_a[index];
            let b = perm.perm_b[index];
            let hash =
                (a.wrapping_mul(calculate_hash(input)).wrapping_add(b)).wrapping_rem(MINHASH_PRIME);

            if hash < self.hash[index] {
                self.hash[index] = hash;
            }

            index += 1;
        }
    }

    pub fn jaccard(&self, h: &MinHash) -> f64 {
        let mut shared: u32 = 0;

        for (i, v) in self.hash.iter().enumerate() {
            if h.hash[i] == *v {
                shared += 1;
            }
        }

        f64::from(shared) / (self.num_perm() as f64)
    }
}

#[derive(Debug)]
pub struct LshIndex {
    index: HashMap<u64, HashSet<String>>,
    band_size: u64,
}

fn get_hash_bands(hashes: &Vec<u64>, band_size: u64) -> Vec<u64> {
    let mut ret: Vec<u64> = Vec::new();
    let size = hashes.capacity();

    let mut i: usize = 0;
    let _band_size = band_size as usize;

    while i < size {
        let end = i + _band_size;

        let mut hasher = XxHash64::with_seed(XXHASH_SEED);

        while i < end {
            hasher.write_u64(hashes[i]);
            i += 1;
        }

        ret.push(hasher.finish());
    }

    ret
}

impl LshIndex {
    pub fn new(band_size: u64) -> LshIndex {
        LshIndex {
            index: HashMap::new(),
            band_size,
        }
    }

    pub fn insert(&mut self, key: String, h: &MinHash) {
        let hash_bands = get_hash_bands(&h.hash, self.band_size);

        for band in &hash_bands {
            self.index
                .entry(*band)
                .or_insert_with(HashSet::new)
                .insert(key.to_owned());
        }
    }

    pub fn query(&self, h: &MinHash) -> Vec<String> {
        let hash_bands = get_hash_bands(&h.hash, self.band_size);
        let mut ret: HashSet<String> = HashSet::new();

        for band in &hash_bands {
            if let Some(set) = self.index.get(band) {
                for val in set {
                    ret.insert(val.to_owned());
                }
            }
        }

        let mut vec: Vec<String> = Vec::with_capacity(ret.len());

        for v in &ret {
            vec.push(v.to_owned());
        }

        vec
    }
}
