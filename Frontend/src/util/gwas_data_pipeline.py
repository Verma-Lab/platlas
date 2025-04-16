import pandas as pd
import numpy as np
import os
import json
import matplotlib.pyplot as plt

thresh = -np.log10(5e-8)
qq_data = {}


def mkdirs(path):
    if not os.path.isdir(path):
        os.makedirs(path)


def format_gwas_for_plot(chr, df):
    return {
        'x': df['pos'].tolist(),
        'y': df['log_p'].tolist(),
        'chr': chr
    }

def make_comp_qq(outdir):
    for pheno in qq_data.keys():
        plt.figure()
        plt.xlabel('Observed Values')
        plt.ylabel('Theoretical Values')
        for cohort in qq_data[pheno].keys():
            data = qq_data[pheno][cohort]
            plt.scatter(x=data['x'], y=data['y'], label=cohort)
        
        plt.legend(loc="upper left")
        plt.savefig('{}/{}/qq_comp.png'.format(outdir, pheno), dpi=600)
        plt.clf()


def make_ind_qq(x, outdir, pheno, cohort):
    n = x.size
    x.sort()
    y = -np.log10(np.linspace(1, 1/n, num=n))
    y.sort()

    if (pheno in qq_data):
        qq_data[pheno][cohort] = {'x': x, 'y': y}
    else:
        qq_data[pheno] = {cohort: {'x': x, 'y': y}}

    plt.scatter(x=x, y=y)
    plt.xlabel('Observed Values')
    plt.ylabel('Theoretical Values')
    plt.savefig('{}/{}/{}/qq.png'.format(outdir, pheno, cohort), dpi=600)
    plt.clf()


def gwas(indir, outdir, file):
    file_split = file.split('.')
    pheno = file_split[2]
    cohort = file_split[3]

    mkdirs('{}/{}'.format(outdir, pheno))
    mkdirs('{}/{}/{}'.format(outdir, pheno, cohort))

    cols = ['chrom', 'pos', 'log_p', 'pval']
    df = pd.read_csv('{}/{}'.format(indir, file), delimiter='\t',index_col=False)
    df['log_p'] = -np.log10(df['pval'])

    make_ind_qq(df['log_p'].to_numpy().copy(), outdir, pheno, cohort)

    table_df = df.loc[df['pval'] <= 10e-6]
    table_df.to_json('{}/{}/{}/table.json'.format(outdir, pheno, cohort), orient='records')

    start_pos = [0]*23        
    dyn_out = [None]*23
    stat_out = [None]*23
    meta_out = {}

    for key in range(1, 23):
        df_chr = df.loc[df['chrom'] == (key)]
        if (df_chr.empty):
            start_pos[key] = start_pos[key-1] + 1000
        else:
            start_pos[key] = df_chr['pos'].max() + 1
        
    start_pos = np.cumsum(start_pos).tolist()

    for key in range(1, 24):
        df_chr = df.loc[df['chrom'] == key]

        if (df_chr.empty):
            continue 

        df_chr['pos'] += start_pos[key]

        dyn_chr = df_chr.loc[df_chr['log_p'] >= thresh][cols]
        stat_chr = df_chr.loc[df_chr['log_p'] < thresh][cols]
        stat_chr_sample = df_chr.loc[df_chr['log_p'] < thresh][cols].sample(n=max(1000, stat_chr.shape[0]//1000))
        
        dyn_out[key - 1] = format_gwas_for_plot(key, dyn_chr)
        stat_out[key - 1] = format_gwas_for_plot(key, stat_chr_sample)

    meta_out['ticks'] = start_pos

    with open('{}/{}/{}/dyn.json'.format(outdir, pheno, cohort), 'w') as i:
        json.dump(dyn_out, i)

    with open('{}/{}/{}/stat.json'.format(outdir, pheno, cohort), 'w') as f:
        json.dump(stat_out, f)

    with open('{}/{}/{}/ticks.json'.format(outdir, pheno, cohort), 'w') as t:
        json.dump(meta_out, t)


def handle_metadata(indir, file):
    tb = pd.read_csv('{}/{}'.format(indir, file), delimiter='\t')
    return tb.to_dict(orient='records')


def main():
    indir = '/Users/nimay/Desktop/gwas_results/'
    outdir = '/Users/nimay/Desktop/all-by-all-browser/src/data/gwas/'
    phenos = {}

    for file in os.listdir(indir):
        if (not file.endswith('.txt')):
            continue

        f_split = file.split('.')
        
        pheno = f_split[2]
        coh = f_split[3]

        if (f_split[6] == 'metadata'):
            metadata = handle_metadata(indir, file)
            if pheno not in phenos:
                phenos[pheno] = {'metadata': {coh: metadata}, 'cohorts': []}
            else:
                phenos[pheno]['metadata'][coh] = metadata
        else:
            if pheno not in phenos:
                phenos[pheno] = {'cohorts': [coh], 'metadata': {}}
            elif coh not in phenos[pheno]['cohorts']:
                phenos[pheno]['cohorts'].append(coh)

            gwas(indir, outdir, file)
    
    with open('{}/meta.json'.format(outdir), 'w') as p:
        json.dump(phenos, p)

    make_comp_qq(outdir)


if __name__ == '__main__':  
    main()