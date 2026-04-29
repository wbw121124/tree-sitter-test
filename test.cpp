#include<bits/stdc++.h>
typedef int int32;
#define int long long
#define double long double
using namespace std;
const int N = 1e5 + 5;
int n, tree[N << 2], cnt;
const double eps = 1e-12;
struct node {
	double k, b;
}a[N];
int cmp(double x, double y)
{
	if (x - y > eps)
		return 1;
	if (y - x > eps)
		return -1;
	return 0;
}
double calc(int id, int d)
{
	return a[id].b + a[id].k * d;
}
void pushdown(int x, int l, int r, int u)
{
	int& v = tree[x], mid = (l + r) >> 1;
	int tmp = cmp(calc(u, mid), calc(v, mid));
	if (tmp == 1 || (!tmp && u < v))
		swap(u, v);
	int tmp1 = cmp(calc(u, l), calc(v, l)),
		tmp2 = cmp(calc(u, r), calc(v, r));
	if (tmp1 == 1 || (!tmp1 && u < v))
		pushdown(x << 1, l, mid, u);
	if (tmp2 == 1 || (!tmp2 && u < v))
		pushdown((x << 1) | 1, mid + 1, r, u);
	return;
}
pair<double, int>max(pair<double, int>u, pair<double, int>v)
{
	if (cmp(u.first, v.first) == -1)
		return v;
	if (cmp(u.first, v.first) == 1)
		return u;
	if (u.second < v.second)
		return u;
	return v;
}
void update(int x, int l, int r, int ql, int qr, int u)
{
	if (ql > r || l > qr)
		return;
	if (ql <= l && qr >= r)
	{
		pushdown(x, l, r, u);
		return;
	}
	int mid = (l + r) >> 1;
	update(x << 1, l, mid, ql, qr, u);
	update((x << 1) | 1, mid + 1, r, ql, qr, u);
	return;
}
pair<double, int>query(int x, int l, int r, int val)
{
	if (val < l || val > r)
		return { 0,0 };
	double tmp = calc(tree[x], val);
	if (l == r)
		return { tmp,tree[x] };
	int mid = (l + r) >> 1;
	return ::max({ tmp,tree[x] }, ::max(query(x << 1, l, mid, val),
		query((x << 1) | 1, mid + 1, r, val)));
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0), cout.tie(0);
	cin >> n;
	while (n--)
	{
		string opt;
		cin >> opt;
		if (opt == "Project")
		{
			cnt++;
			cin >> a[cnt].b >> a[cnt].k;
			a[cnt].b -= a[cnt].k;
			update(1, 1, 5e4, 1, 5e4, cnt);
		}
		else
		{
			int x;
			cin >> x;
			cout << (int)(query(1, 1, 5e4,
				x).first / 100) << '\n';
		}
	}
	return 0;
}