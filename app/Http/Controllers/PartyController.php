<?php

namespace App\Http\Controllers;

use App\Enums\AreaType;
use App\Enums\OpeningBalanceType;
use App\Enums\PartyType;
use App\Enums\RecordStatus;
use App\Http\Requests\SavePartyRequest;
use App\Models\Business;
use App\Models\Party;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PartyController extends Controller
{
    public function index(Request $request): Response
    {
        $business = Business::current();
        $search = trim((string) $request->query('search', ''));
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'created_at';
        }

        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $parties = Party::query()
            ->with('business:id,name')
            ->whereBelongsTo($business)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('parties/index', [
            'parties' => $parties,
            'queryString' => [
                'page' => $request->query('page') !== null ? $parties->currentPage() : null,
                'search' => $search !== '' ? $search : null,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function show(Party $party): Response
    {

        $party->load([
            'contactPersons' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('name'),
        ]);

        return Inertia::render('parties/show', [
            'party' => $party,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('parties/create', [
            'partyTypeOptions' => PartyType::options(),
            'openingBalanceTypeOptions' => OpeningBalanceType::options(),
            'areaTypeOptions' => AreaType::options(),
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function store(SavePartyRequest $request): RedirectResponse
    {
        $party = Party::create($request->validated());

        return to_route('parties.show', $party)
            ->with('status', 'Party created successfully.');
    }

    public function edit(Party $party): Response
    {
        return Inertia::render('parties/edit', [
            'party' => $party,
            'partyTypeOptions' => PartyType::options(),
            'openingBalanceTypeOptions' => OpeningBalanceType::options(),
            'areaTypeOptions' => AreaType::options(),
            'statusOptions' => RecordStatus::options(),
        ]);
    }

    public function update(SavePartyRequest $request, Party $party): RedirectResponse
    {
        $party->update($request->validated());

        return to_route('parties.show', $party)
            ->with('status', 'Party updated successfully.');
    }

    public function destroy(Party $party): RedirectResponse
    {
        if ($party->supplierPurchases()->exists()) {
            throw ValidationException::withMessages([
                'party' => 'Delete the related purchases before deleting this party.',
            ]);
        }

        $party->delete();

        return to_route('parties.index')
            ->with('status', 'Party deleted successfully.');
    }
}
